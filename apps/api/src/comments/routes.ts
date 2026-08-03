import { Router } from 'express';
import passport from 'passport';
import { createComment, listComments } from './service.js';
import { logEvent, redactError } from '../lib/logger.js';

export function buildCommentsRouter(database) {
  const router = Router();

  router.get('/posts/:postId/comments', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      response.json({ comments: await listComments(database, request.params.postId, request.user.id) });
    } catch (error) {
      logEvent('warn', 'comment_list_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.post('/posts/:postId/comments', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const comment = await createComment(database, {
        postId: request.params.postId,
        userId: request.user.id,
        body: request.body?.body
      });
      response.status(201).json({ comment });
    } catch (error) {
      logEvent('error', 'comment_create_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  return router;
}
