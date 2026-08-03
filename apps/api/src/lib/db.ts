import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { createRepository } from './repository.js';
import { runMigrations } from './migrations.js';
import { normalizeQuery } from './sql.js';
import { logEvent, redactError } from './logger.js';

function resolveMigrationsDir() {
  const currentFile = fileURLToPath(import.meta.url);
  const srcDir = path.dirname(path.dirname(currentFile));
  return path.join(srcDir, '..', 'migrations');
}

function createAlbumSearchResults() {
  return [
    {
      albumMusicBrainzId: 'mbid-demo-1',
      albumTitle: 'Blue Train',
      artistName: 'John Coltrane',
      releaseYear: '1957',
      albumArtUrl: 'https://dummyimage.com/600x600/ddd/111&text=Blue+Train'
    },
    {
      albumMusicBrainzId: 'mbid-demo-2',
      albumTitle: 'Abbey Road',
      artistName: 'The Beatles',
      releaseYear: '1969',
      albumArtUrl: 'https://dummyimage.com/600x600/ddd/111&text=Abbey+Road'
    },
    {
      albumMusicBrainzId: 'mbid-demo-3',
      albumTitle: 'To Pimp a Butterfly',
      artistName: 'Kendrick Lamar',
      releaseYear: '2015',
      albumArtUrl: 'https://dummyimage.com/600x600/ddd/111&text=TPAB'
    }
  ];
}

interface DatabaseOptions {
  connectionString?: string;
  migrationsDir?: string;
  runMigrations?: boolean;
  adapter?: 'postgres' | 'pg-mem';
}

export async function createDatabase(options: DatabaseOptions = {}) {
  const config = options;
  let pool;
  const adapter = config.adapter ?? 'postgres';

  if (adapter === 'pg-mem') {
    const { newDb } = await import('pg-mem');
    const inMemoryDb = newDb();
    inMemoryDb.public.registerFunction({
      name: 'version',
      returns: 'text',
      implementation: () => 'PostgreSQL 18.0 (pg-mem)'
    });
    inMemoryDb.public.registerFunction({
      name: 'char_length',
      args: ['text'],
      returns: 'int4',
      implementation: (value) => String(value ?? '').length
    });
    const pgMem = inMemoryDb.adapters.createPg();
    pool = new pgMem.Pool();
  } else {
    const connectionString = config.connectionString ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    pool = new Pool({ connectionString });
  }

  try {
    await pool.query('SELECT 1');
  } catch (error) {
    logEvent('error', 'database_connectivity_check_failed', {
      error: redactError(error)
    });
    throw error;
  }

  const migrationsDir = config.migrationsDir ?? resolveMigrationsDir();
  const shouldRunMigrations = config.runMigrations !== false;

  if (shouldRunMigrations) {
    await runMigrations(pool, migrationsDir);
  }

  const repository = createRepository(pool);

  return {
    ...repository,
    async close() {
      await pool.end();
    },
    searchAlbum(query, type = 'album') {
      const q = normalizeQuery(query);
      const demoResults = createAlbumSearchResults();

      return demoResults.filter((entry) => {
        if (!q) {
          return true;
        }

        return normalizeQuery(type) === 'artist'
          ? normalizeQuery(entry.artistName).includes(q)
          : normalizeQuery(entry.albumTitle).includes(q) || normalizeQuery(entry.artistName).includes(q);
      });
    }
  };
}
