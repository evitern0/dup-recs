import { createApp } from './app.js';
import { database } from './lib/db.js';

const port = process.env.PORT ?? 3001;
const app = createApp(database);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`dup-recs API listening on ${port}`);
  });
}

export default app;
