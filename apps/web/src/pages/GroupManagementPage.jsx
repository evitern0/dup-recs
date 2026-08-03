import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { GroupActions } from '../components/groups/GroupActions.jsx';

export function GroupManagementPage({ onSelectGroup }) {
  const navigate = useNavigate();
  const { session, apiRequest: authedRequest, refreshMemberships, setActiveGroupId } = useAuth();
  const groups = session.groups ?? [];

  async function createGroup(groupName) {
    const response = await authedRequest('/groups', { method: 'POST', body: { name: groupName } });
    setActiveGroupId(response.group.id);
    await refreshMemberships(response.group.id);
    onSelectGroup(response.group.id);
    navigate('/app');
  }

  async function joinGroup(inviteToken) {
    const response = await authedRequest('/groups/join', { method: 'POST', body: { inviteToken } });
    setActiveGroupId(response.membership.groupId);
    await refreshMemberships(response.membership.groupId);
    onSelectGroup(response.membership.groupId);
    navigate('/app');
  }

  function openGroup(groupId) {
    setActiveGroupId(groupId);
    onSelectGroup(groupId);
    navigate('/app');
  }

  return (
    <div className="grid">
      <div className="stack">
        <section className="surface stack">
          <div>
            <h1 style={{ margin: 0 }}>Your groups</h1>
            <p className="helper">Open a timeline, create a new group, or join with an invite token.</p>
          </div>
          {groups.length > 0 ? (
            <div className="row">
              {groups.map((group) => (
                <button key={group.id} type="button" className="member-chip" onClick={() => openGroup(group.id)}>
                  {group.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="helper">You do not belong to any groups yet.</p>
          )}
        </section>
        <GroupActions title="Create a new group or join an existing one" onCreateGroup={createGroup} onJoinGroup={joinGroup} />
      </div>
      <div className="surface stack">
        <h2 className="section-title">How it works</h2>
        <p className="helper">Select a group to open its timeline, or create/join a group to start sharing recommendations.</p>
      </div>
    </div>
  );
}