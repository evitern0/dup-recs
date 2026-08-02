import { Router } from 'express';
import passport from 'passport';
import { searchAlbums } from '../albums/search.js';
import { createRecommendation, getTimeline } from './service.js';

export function buildPostsRouter(database) {
  const router = Router();

  router.get('/albums/search', passport.authenticate('jwt', { session: false }), (request, response) => {
    const { query, type } = request.query ?? {};
    response.json({ results: searchAlbums(database, query, type) });
  });

  router.get('/groups/:groupId/timeline', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const { cursor, limit } = request.query ?? {};
      response.json({
        ...getTimeline(database, {
          groupId: request.params.groupId,
          userId: request.user.id,
          cursor,
          limit: limit ? Number(limit) : undefined
        })
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/groups/:groupId/posts', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const post = createRecommendation(database, {
        groupId: request.params.groupId,
        userId: request.user.id,
        ...request.body
      });
      response.status(201).json({ post: database.enrichPost(post) });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
