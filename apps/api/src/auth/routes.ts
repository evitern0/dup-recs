import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { assertLength, assertUsername, isEmail } from '@dup-recs/shared';

export function buildAuthRouter(database) {
  const router = Router();

  router.post('/register', async (request, response, next) => {
    try {
      const { email, username, password } = request.body ?? {};
      if (!isEmail(email)) {
        return response.status(400).json({ error: 'valid email is required' });
      }
      assertUsername(username);
      assertLength(password, 255, 'password');

      const user = await database.createUser({ email, username, password });
      const token = jwt.sign({ sub: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET ?? 'dev-secret');
      return response.status(201).json({ user: sanitizeUser(user), token });
    } catch (error) {
      if (error?.code === 'EMAIL_EXISTS' || error?.code === 'USERNAME_EXISTS') {
        return response.status(409).json({ error: error.message });
      }
      return next(error);
    }
  });

  router.post('/login', (request, response, next) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return response.status(401).json({ error: info?.message ?? 'Incorrect email or password. Please try again.' });
      }

      const token = jwt.sign({ sub: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET ?? 'dev-secret');
      return response.json({ user: sanitizeUser(user), token });
    })(request, response, next);
  });

  router.get('/me', passport.authenticate('jwt', { session: false }), (request, response) => {
    response.json({ user: sanitizeUser(request.user) });
  });

  return router;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt
  };
}
