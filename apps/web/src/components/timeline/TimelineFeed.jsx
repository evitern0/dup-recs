import React from 'react';
import { PostCard } from '../posts/PostCard.jsx';

export function TimelineFeed({ posts = [], openCommentIds, onToggleComments, onAddComment }) {
  return (
    <div className="timeline">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          commentsOpen={openCommentIds.has(post.id)}
          onToggleComments={() => onToggleComments(post.id)}
          onAddComment={(body) => onAddComment(post.id, body)}
        />
      ))}
    </div>
  );
}
