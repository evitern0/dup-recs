import { createApp } from './app.js';
import { createDatabase } from './lib/db.js';
import { logEvent, redactError } from './lib/logger.js';

const port = process.env.PORT ?? 3001;
export async function buildServer() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const database = await createDatabase({ connectionString: process.env.DATABASE_URL });
  const app = createApp(database);
  return { app, database };
}

let app;

if (process.env.NODE_ENV !== 'test') {
  buildServer()
    .then(({ app: serverApp }) => {
      app = serverApp;
      app.listen(port, () => {
        logEvent('info', 'api_started', { port });
      });
    })
    .catch((error) => {
      logEvent('error', 'database_startup_failed', {
        port,
        error: redactError(error)
      });
      process.exitCode = 1;
    });
}

export default app;
