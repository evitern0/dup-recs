import { requireMembership } from '../lib/authorization.js';

export async function getMemberHistory(database, username, requesterId) {
  const history = await database.listUserPosts(username);
  if (!history) {
    return null;
  }

  const firstPost = history.posts[0];
  if (firstPost) {
    await requireMembership(database, firstPost.groupId, requesterId);
  }

  return history;
}
