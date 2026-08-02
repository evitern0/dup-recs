import express from 'express';
import passport from 'passport';
import { configurePassport } from './auth/passport.js';
import { buildAuthRouter } from './auth/routes.js';
import { buildGroupsRouter } from './groups/routes.js';
import { buildPostsRouter } from './posts/routes.js';
import { buildCommentsRouter } from './comments/routes.js';
import { buildUsersRouter } from './users/routes.js';

export function createApp(database) {
  configurePassport(database);

  const app = express();
  app.use(express.json());
  app.use(passport.initialize());

  app.get('/health', (request, response) => response.json({ ok: true }));
  app.use('/api/auth', buildAuthRouter(database));
  app.use('/api/groups', buildGroupsRouter(database));
  app.use('/api', buildPostsRouter(database));
  app.use('/api', buildCommentsRouter(database));
  app.use('/api/users', buildUsersRouter(database));

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      return next(error);
    }

    const statusCode = error.statusCode ?? 400;
    response.status(statusCode).json({ error: error.message ?? 'unexpected error' });
  });

  return app;
}
