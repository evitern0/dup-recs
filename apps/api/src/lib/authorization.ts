export async function requireMembership(database, groupId, userId) {
  const membership = await database.getMembership(groupId, userId);
  if (!membership) {
    const error = new Error('membership required');
    error.statusCode = 403;
    throw error;
  }
  return membership;
}

export async function canAccessGroup(database, groupId, userId) {
  return Boolean(await database.getMembership(groupId, userId));
}
