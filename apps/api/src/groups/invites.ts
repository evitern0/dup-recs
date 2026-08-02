export function createInvite(database, { groupId, email, invitedByUserId }) {
  return database.createInvite({ groupId, email, invitedByUserId });
}

export function acceptInvite(database, { token, userId }) {
  return database.acceptInvite(token, userId);
}
