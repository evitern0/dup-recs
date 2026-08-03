import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { GroupActions } from '../components/groups/GroupActions.jsx';
import { MemberList } from '../components/groups/MemberList.jsx';
import { InviteForm } from '../components/groups/InviteForm.jsx';
import { NewRecComposer } from '../components/timeline/NewRecComposer.jsx';
import { TimelineFeed } from '../components/timeline/TimelineFeed.jsx';

export function GroupTimelinePage({ onSelectGroup }) {
  const { session, apiRequest: authedRequest, refreshMemberships } = useAuth();
  const [groupId, setGroupId] = useState(session.activeGroupId ?? '');
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState('');
  const [openCommentIds, setOpenCommentIds] = useState(() => new Set());
  const loadMoreAnchor = useRef(null);
  const currentGroupName = session.groups?.find((group) => group.id === groupId)?.name;

  useEffect(() => {
    if (groupId) {
      loadGroup(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && nextCursor) {
        loadMore(nextCursor);
      }
    });

    if (loadMoreAnchor.current) {
      observer.observe(loadMoreAnchor.current);
    }

    return () => observer.disconnect();
  }, [nextCursor]);

  async function loadGroup(activeGroupId) {
    setError('');
    try {
      const timeline = await authedRequest(`/groups/${activeGroupId}/timeline?limit=10`);
      const memberResponse = await authedRequest(`/groups/${activeGroupId}/members`);
      setPosts(timeline.posts ?? []);
      setNextCursor(timeline.nextCursor ?? null);
      setMembers(memberResponse.members ?? []);
      onSelectGroup(activeGroupId);
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function loadMore(cursor) {
    if (!groupId || !cursor) {
      return;
    }
    const timeline = await authedRequest(`/groups/${groupId}/timeline?limit=10&cursor=${cursor}`);
    setPosts((current) => [...current, ...(timeline.posts ?? [])]);
    setNextCursor(timeline.nextCursor ?? null);
  }

  async function createGroup(groupName) {
    const response = await authedRequest('/groups', { method: 'POST', body: { name: groupName } });
    setGroupId(response.group.id);
    await refreshMemberships(response.group.id);
    onSelectGroup(response.group.id);
    await loadGroup(response.group.id);
  }

  async function joinGroupByInvite(currentInviteToken) {
    const response = await authedRequest('/groups/join', { method: 'POST', body: { inviteToken: currentInviteToken } });
    setGroupId(response.membership.groupId);
    await refreshMemberships(response.membership.groupId);
    onSelectGroup(response.membership.groupId);
    await loadGroup(response.membership.groupId);
  }

  async function inviteMember(email) {
    await authedRequest(`/groups/${groupId}/invites`, { method: 'POST', body: { email } });
  }

  async function searchAlbums({ query, type }) {
    const response = await authedRequest(`/albums/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
    setAlbums(response.results ?? []);
  }

  async function submitPost(post) {
    await authedRequest(`/groups/${groupId}/posts`, { method: 'POST', body: post });
    await loadGroup(groupId);
  }

  async function addComment(postId, body) {
    await authedRequest(`/posts/${postId}/comments`, { method: 'POST', body: { body } });
    await loadGroup(groupId);
  }

  if (!groupId) {
    return (
      <div className="grid">
        <section className="surface stack">
          <h1>Welcome, {session.user.username}</h1>
          <p className="helper">Create a group or join one through an invite to unlock the timeline.</p>
          <GroupActions onCreateGroup={createGroup} onJoinGroup={joinGroupByInvite} />
          {error ? <p className="helper">{error}</p> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="stack">
        <section className="surface stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0 }}>{currentGroupName ? `Viewing ${currentGroupName}` : 'Your timeline'}</h1>
              <p className="helper">Recent recs from {currentGroupName ?? 'your group'}, newest first.</p>
            </div>
          </div>
          {error ? <p className="helper">{error}</p> : null}
        </section>
        <NewRecComposer onSearch={searchAlbums} onSubmit={submitPost} searchResults={albums} />
        <TimelineFeed
          posts={posts}
          openCommentIds={openCommentIds}
          onToggleComments={(postId) => {
            setOpenCommentIds((current) => {
              const next = new Set(current);
              next.has(postId) ? next.delete(postId) : next.add(postId);
              return next;
            });
          }}
          onAddComment={addComment}
        />
        <div ref={loadMoreAnchor} style={{ height: '1px' }} />
      </div>
      <div className="stack">
        <InviteForm onInvite={inviteMember} />
        <MemberList members={members} />
        <GroupActions onCreateGroup={createGroup} onJoinGroup={joinGroupByInvite} />
      </div>
    </div>
  );
}
