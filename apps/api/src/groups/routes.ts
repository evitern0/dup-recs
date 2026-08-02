import { Router } from 'express';
import passport from 'passport';
import { createInvite } from './invites.js';
import { listMembers } from './members.js';

export function buildGroupsRouter(database) {
  const router = Router();

  router.post('/', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const { name } = request.body ?? {};
      const group = database.createGroup({ name, createdByUserId: request.user.id });
      response.status(201).json({ group });
    } catch (error) {
      next(error);
    }
  });

  router.post('/join', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const { inviteToken } = request.body ?? {};
      const membership = database.acceptInvite(inviteToken, request.user.id);
      response.status(201).json({ membership });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:groupId/join', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const { inviteToken } = request.body ?? {};
      if (inviteToken) {
        database.acceptInvite(inviteToken, request.user.id);
      } else {
        database.joinGroup({ groupId: request.params.groupId, userId: request.user.id });
      }
      response.status(201).json({ membership: database.getMembership(request.params.groupId, request.user.id) });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:groupId/members', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      response.json({ members: listMembers(database, request.params.groupId, request.user.id) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:groupId/invites', passport.authenticate('jwt', { session: false }), (request, response, next) => {
    try {
      const invite = createInvite(database, {
        groupId: request.params.groupId,
        email: request.body?.email,
        invitedByUserId: request.user.id
      });
      response.status(201).json({ invitation: invite });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
