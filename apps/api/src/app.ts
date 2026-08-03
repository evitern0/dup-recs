import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { configurePassport } from './auth/passport.js';
import { buildAuthRouter } from './auth/routes.js';
import { buildGroupsRouter } from './groups/routes.js';
import { buildPostsRouter } from './posts/routes.js';
import { buildCommentsRouter } from './comments/routes.js';
import { buildUsersRouter } from './users/routes.js';
import { createRequestId, logEvent, redactError } from './lib/logger.js';

export function createApp(database) {
  configurePassport(database);

  const app = express();
  app.use(cors({ 
    origin: 'http://localhost:5173', 
    credentials: true 
  }));
  app.use(express.json());
  app.use(passport.initialize());
  app.use((request, response, next) => {
    request.requestId = createRequestId();
    response.setHeader('x-request-id', request.requestId);
    next();
  });

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
    const event = request.path.includes('/groups')
      ? 'group_request_failed'
      : request.path.includes('/posts')
        ? 'post_request_failed'
        : request.path.includes('/comments')
          ? 'comment_request_failed'
          : 'api_request_failed';

    logEvent(statusCode >= 500 ? 'error' : 'warn', event, {
      requestId: request.requestId,
      method: request.method,
      path: request.path,
      statusCode,
      error: redactError(error)
    });

    response.status(statusCode).json({ error: error.message ?? 'unexpected error' });
  });

  return app;
}
