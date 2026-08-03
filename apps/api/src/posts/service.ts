import { INITIAL_TIMELINE_PAGE_SIZE } from '@dup-recs/shared';
import { requireMembership } from '../lib/authorization.js';

export async function createRecommendation(database, input) {
  await requireMembership(database, input.groupId, input.userId);
  return database.createPost(input);
}

export async function getTimeline(database, { groupId, userId, cursor, limit = INITIAL_TIMELINE_PAGE_SIZE }) {
  await requireMembership(database, groupId, userId);
  return database.listGroupPosts(groupId, { cursor, limit });
}

export function updatePostSnapshot(database, post) {
  return post;
}
