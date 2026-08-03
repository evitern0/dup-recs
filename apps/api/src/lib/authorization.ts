import { AppError } from './sql.js';

export async function requireMembership(database, groupId, userId) {
  const membership = await database.getMembership(groupId, userId);
  if (!membership) {
    throw new AppError('membership required', 403, 'MEMBERSHIP_REQUIRED');
  }
  return membership;
}

export async function canAccessGroup(database, groupId, userId) {
  return Boolean(await database.getMembership(groupId, userId));
}
