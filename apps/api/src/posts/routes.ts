import { Router } from 'express';
import passport from 'passport';
import { searchAlbums } from '../albums/search.js';
import { createRecommendation, getTimeline } from './service.js';
import { logEvent, redactError } from '../lib/logger.js';

export function buildPostsRouter(database) {
  const router = Router();

  router.get('/albums/search', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const { query, type } = request.query ?? {};
      response.json({ results: searchAlbums(database, query, type) });
    } catch (error) {
      logEvent('warn', 'album_search_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.get('/groups/:groupId/timeline', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const { cursor, limit } = request.query ?? {};
      response.json({
        ...(await getTimeline(database, {
          groupId: request.params.groupId,
          userId: request.user.id,
          cursor,
          limit: limit ? Number(limit) : undefined
        }))
      });
    } catch (error) {
      logEvent('warn', 'timeline_load_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.post('/groups/:groupId/posts', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const post = await createRecommendation(database, {
        groupId: request.params.groupId,
        userId: request.user.id,
        ...request.body
      });
      response.status(201).json({ post: await database.enrichPost(post) });
    } catch (error) {
      logEvent('error', 'album_share_create_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  return router;
}
