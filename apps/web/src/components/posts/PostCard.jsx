import React, { useState } from 'react';

export function PostCard({ post, onToggleComments, commentsOpen, onAddComment }) {
  const [body, setBody] = useState('');

  return (
    <article className="post-card">
      <div className="post-header">
        <img className="album-art" src={post.albumArtUrl} alt={post.albumTitle} />
        <div className="post-body">
          <h4 className="post-title">{post.albumTitle}</h4>
          <div className="post-meta">
            by <strong>{post.author?.username ?? 'unknown'}</strong> · {post.artistName} · {post.releaseYear}
          </div>
          <p>{post.description}</p>
          <button className="button-secondary" type="button" onClick={onToggleComments}>
            {commentsOpen ? 'Hide comments' : `Show comments (${post.comments?.length ?? 0})`}
          </button>
        </div>
      </div>

      {commentsOpen ? (
        <div className="comment-thread">
          {(post.comments ?? []).map((comment) => (
            <div key={comment.id} className="comment">
              <strong>{comment.user?.username ?? 'member'}</strong>
              <div>{comment.body}</div>
            </div>
          ))}
          <form
            className="stack"
            onSubmit={async (event) => {
              event.preventDefault();
              await onAddComment(body);
              setBody('');
            }}
          >
            <textarea
              maxLength={255}
              placeholder="Add a comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <button className="button" type="submit">
              Comment
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
