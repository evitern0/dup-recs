import { requireMembership } from '../lib/authorization.js';

export function getMemberHistory(database, username, requesterId) {
  const history = database.listUserPosts(username);
  if (!history) {
    return null;
  }

  const firstPost = history.posts[0];
  if (firstPost) {
    requireMembership(database, firstPost.groupId, requesterId);
  }

  return history;
}
