import { INITIAL_TIMELINE_PAGE_SIZE } from '@dup-recs/shared';
import { requireMembership } from '../lib/authorization.js';

export function createRecommendation(database, input) {
  requireMembership(database, input.groupId, input.userId);
  return database.createPost(input);
}

export function getTimeline(database, { groupId, userId, cursor, limit = INITIAL_TIMELINE_PAGE_SIZE }) {
  requireMembership(database, groupId, userId);
  return database.listGroupPosts(groupId, { cursor, limit });
}

export function updatePostSnapshot(database, post) {
  return post;
}
