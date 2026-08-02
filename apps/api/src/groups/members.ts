export function listMembers(database, groupId, userId) {
  database.assertMembership(groupId, userId);
  return database.listGroupMembers(groupId).filter((member) => member.id !== userId);
}
