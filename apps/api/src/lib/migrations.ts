import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export async function runMigrations(pool, migrationsDir) {
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .filter((name) => name !== '001_initial.sql')
    .sort((left, right) => left.localeCompare(right));

  const trackingMigrationFile = '000_schema_migrations.sql';
  const versionResult = await pool.query('SELECT version() AS version');
  const isPgMem = String(versionResult.rows[0]?.version ?? '').toLowerCase().includes('pg-mem');

  if (isPgMem) {
    for (const fileName of files) {
      if (fileName === trackingMigrationFile) {
        continue;
      }

      const fullPath = path.join(migrationsDir, fileName);
      const sql = await readFile(fullPath, 'utf8');
      await pool.query(sql);
    }

    return;
  }

  const hasTrackingMigration = files.includes(trackingMigrationFile);
  const trackingTableResult = await pool.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'schema_migrations'
    ) AS has_tracking_table
  `);
  const hasTrackingTable = Boolean(trackingTableResult.rows[0]?.has_tracking_table);

  if (!hasTrackingTable && hasTrackingMigration) {
    const trackingSqlPath = path.join(migrationsDir, trackingMigrationFile);
    const trackingSql = await readFile(trackingSqlPath, 'utf8');
    await pool.query(trackingSql);
  }

  await pool.query('ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT');

  const migrationContents = new Map();
  const migrationChecksums = new Map();

  for (const fileName of files) {
    const fullPath = path.join(migrationsDir, fileName);
    const sql = await readFile(fullPath, 'utf8');
    migrationContents.set(fileName, sql);
    migrationChecksums.set(fileName, createHash('sha256').update(sql).digest('hex'));
  }

  const appliedResult = await pool.query('SELECT file_name, checksum FROM schema_migrations');
  const appliedMigrations = new Set();

  for (const row of appliedResult.rows) {
    const fileName = row.file_name;
    const persistedChecksum = row.checksum;
    const currentChecksum = migrationChecksums.get(fileName);

    if (!currentChecksum) {
      throw new Error(`Applied migration file is missing: ${fileName}`);
    }

    if (!persistedChecksum) {
      await pool.query('UPDATE schema_migrations SET checksum = $1 WHERE file_name = $2', [currentChecksum, fileName]);
      appliedMigrations.add(fileName);
      continue;
    }

    if (persistedChecksum !== currentChecksum) {
      throw new Error(`Migration checksum mismatch for ${fileName}. This migration was modified after being applied.`);
    }

    appliedMigrations.add(fileName);
  }
  const existingSchemaResult = await pool.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AS has_users_table
  `);
  const hasExistingSchema = Boolean(existingSchemaResult.rows[0]?.has_users_table);

  for (const fileName of files) {
    if (appliedMigrations.has(fileName)) {
      continue;
    }

    const sql = migrationContents.get(fileName);
    const checksum = migrationChecksums.get(fileName);

    if (!sql || !checksum) {
      throw new Error(`Unable to load migration content for ${fileName}`);
    }

    if (hasExistingSchema && /\bDROP\s+TABLE\b/i.test(sql)) {
      await pool.query(
        'INSERT INTO schema_migrations (file_name, checksum) VALUES ($1, $2) ON CONFLICT (file_name) DO NOTHING',
        [fileName, checksum]
      );
      continue;
    }

    await pool.query(sql);
    await pool.query(
      'INSERT INTO schema_migrations (file_name, checksum) VALUES ($1, $2) ON CONFLICT (file_name) DO NOTHING',
      [fileName, checksum]
    );
  }
}
