import { Router } from 'express';
import passport from 'passport';
import { createInvite } from './invites.js';
import { listMembers } from './members.js';
import { logEvent, redactError } from '../lib/logger.js';

export function buildGroupsRouter(database) {
  const router = Router();

  router.get('/mine', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      response.json({ groups: await database.listUserGroups(request.user.id) });
    } catch (error) {
      logEvent('warn', 'group_membership_list_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.post('/', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const { name } = request.body ?? {};
      const group = await database.createGroup({ name, createdByUserId: request.user.id });
      response.status(201).json({ group });
    } catch (error) {
      logEvent('error', 'group_create_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.post('/join', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const { inviteToken } = request.body ?? {};
      const membership = await database.acceptInvite(inviteToken, request.user.id);
      response.status(201).json({ membership });
    } catch (error) {
      logEvent('error', 'group_join_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.post('/:groupId/join', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const { inviteToken } = request.body ?? {};
      if (inviteToken) {
        await database.acceptInvite(inviteToken, request.user.id);
      } else {
        await database.joinGroup({ groupId: request.params.groupId, userId: request.user.id });
      }
      response.status(201).json({ membership: await database.getMembership(request.params.groupId, request.user.id) });
    } catch (error) {
      logEvent('error', 'group_membership_write_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.get('/:groupId/members', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      response.json({ members: await listMembers(database, request.params.groupId, request.user.id) });
    } catch (error) {
      logEvent('warn', 'group_members_list_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  router.post('/:groupId/invites', passport.authenticate('jwt', { session: false }), async (request, response, next) => {
    try {
      const invite = await createInvite(database, {
        groupId: request.params.groupId,
        email: request.body?.email,
        invitedByUserId: request.user.id
      });
      response.status(201).json({ invitation: invite });
    } catch (error) {
      logEvent('error', 'group_invite_create_failed', {
        requestId: request.requestId,
        path: request.path,
        error: redactError(error)
      });
      next(error);
    }
  });

  return router;
}
