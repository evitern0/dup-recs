import React, { useState } from 'react';

export function InviteForm({ onInvite }) {
  const [email, setEmail] = useState('');

  return (
    <form
      className="card stack"
      onSubmit={async (event) => {
        event.preventDefault();
        await onInvite(email);
        setEmail('');
      }}
    >
      <h3 className="section-title">Invite by email</h3>
      <input type="email" placeholder="friend@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
      <button className="button" type="submit">
        Send invite
      </button>
    </form>
  );
}
