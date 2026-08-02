import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ProfileHeader } from '../components/profile/ProfileHeader.jsx';
import { ProfileTimeline } from '../components/profile/ProfileTimeline.jsx';

export function MemberProfilePage() {
  const { username } = useParams();
  const { apiRequest } = useAuth();
  const [profile, setProfile] = useState({ user: null, posts: [] });
  const [openCommentIds, setOpenCommentIds] = useState(new Set());

  useEffect(() => {
    apiRequest(`/users/${username}/posts`).then(setProfile).catch(() => setProfile({ user: null, posts: [] }));
  }, [apiRequest, username]);

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <ProfileHeader username={profile.user?.username ?? username} />
        <Link className="button-secondary" to="/app">
          Back to timeline
        </Link>
      </div>
      <ProfileTimeline
        posts={profile.posts}
        openCommentIds={openCommentIds}
        onToggleComments={(postId) => {
          setOpenCommentIds((current) => {
            const next = new Set(current);
            next.has(postId) ? next.delete(postId) : next.add(postId);
            return next;
          });
        }}
        onAddComment={async (postId, body) => {
          await apiRequest(`/posts/${postId}/comments`, { method: 'POST', body: { body } });
          const refreshed = await apiRequest(`/users/${username}/posts`);
          setProfile(refreshed);
        }}
      />
    </div>
  );
}
