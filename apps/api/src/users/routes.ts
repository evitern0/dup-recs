import { Router } from 'express';
import passport from 'passport';
import { getMemberHistory } from './service.js';

export function buildUsersRouter(database) {
  const router = Router();

  router.get('/:username/posts', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const history = getMemberHistory(database, request.params.username, request.user.id);
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
