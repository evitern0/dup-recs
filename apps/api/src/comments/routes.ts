import { Router } from 'express';
import passport from 'passport';
import { createComment, listComments } from './service.js';

export function buildCommentsRouter(database) {
  const router = Router();

  router.get('/posts/:postId/comments', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      response.json({ comments: listComments(database, request.params.postId, request.user.id) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/posts/:postId/comments', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const comment = createComment(database, {
        postId: request.params.postId,
        userId: request.user.id,
        body: request.body?.body
      });
      response.status(201).json({ comment });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
