import { Router } from 'express';
import passport from 'passport';
import { getMemberHistory } from './service.js';

export function buildUsersRouter(database) {
  const router = Router();

  router.get('/:username/posts', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const requesterId = (request.user as any)?.id;
      const history = await getMemberHistory(database, request.params.username, requesterId);
      if (!history) {
        return response.status(404).json({ error: 'user not found' });
      }
      return response.json(history);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
