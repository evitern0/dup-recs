import React from 'react';

export function CommentPanel({ comments = [] }) {
  return (
    <div className="comment-thread">
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <strong>{comment.user?.username ?? 'member'}</strong>
          <div>{comment.body}</div>
        </div>
      ))}
    </div>
  );
}
