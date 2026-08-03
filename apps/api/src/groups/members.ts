export async function listMembers(database, groupId, userId) {
  await database.assertMembership(groupId, userId);
  const members = await database.listGroupMembers(groupId);
  return members.filter((member) => member.id !== userId);
}
