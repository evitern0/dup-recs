export function requireMembership(database, groupId, userId) {
  const membership = database.getMembership(groupId, userId);
  if (!membership) {
    const error = new Error('membership required');
    error.statusCode = 403;
    throw error;
  }
  return membership;
}

export function canAccessGroup(database, groupId, userId) {
  return Boolean(database.getMembership(groupId, userId));
}
