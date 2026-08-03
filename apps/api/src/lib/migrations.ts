import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function runMigrations(pool, migrationsDir) {
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith('.sql'))
    .filter((name) => name !== '001_initial.sql')
    .sort((left, right) => left.localeCompare(right));

  for (const fileName of files) {
    const fullPath = path.join(migrationsDir, fileName);
    const sql = await readFile(fullPath, 'utf8');
    await pool.query(sql);
  }
}
