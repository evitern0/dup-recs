import { requireMembership } from '../lib/authorization.js';

export async function listComments(database, postId, userId) {
  const post = await database.getPostById(postId);
  if (!post) {
    throw new Error('post not found');
  }
  await requireMembership(database, post.groupId, userId);
  return database.listCommentsForPost(postId);
}

export function createComment(database, { postId, userId, body }) {
  return database.addComment({ postId, userId, body });
}
