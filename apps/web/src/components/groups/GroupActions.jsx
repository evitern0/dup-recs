import React, { useState } from 'react';

export function GroupActions({
  onCreateGroup,
  onJoinGroup,
  title = 'Create or join a group',
  createLabel = 'Create group',
  joinLabel = 'Join with invite'
}) {
  const [groupName, setGroupName] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');

  async function handleCreateGroup(event) {
    event.preventDefault();
    setError('');

    try {
      await onCreateGroup(groupName);
      setGroupName('');
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function handleJoinGroup(event) {
    event.preventDefault();
    setError('');

    try {
      await onJoinGroup(inviteToken);
      setInviteToken('');
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  return (
    <section className="card stack">
      <h3 className="section-title">{title}</h3>
      <form className="stack" onSubmit={handleCreateGroup}>
        <input placeholder="Group name" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
        <button className="button" type="submit">
          {createLabel}
        </button>
      </form>
      <form className="stack" onSubmit={handleJoinGroup}>
        <input placeholder="Invite token" value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} />
        <button className="button-secondary" type="submit">
          {joinLabel}
        </button>
      </form>
      {error ? <p className="helper">{error}</p> : null}
    </section>
  );
}