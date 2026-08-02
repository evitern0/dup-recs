import React from 'react';
import { TimelineFeed } from '../timeline/TimelineFeed.jsx';

export function ProfileTimeline({ posts, openCommentIds, onToggleComments, onAddComment }) {
  return (
    <section className="stack">
      <h2 className="section-title">Member history</h2>
      <TimelineFeed
        posts={posts}
        openCommentIds={openCommentIds}
        onToggleComments={onToggleComments}
        onAddComment={onAddComment}
      />
    </section>
  );
}
