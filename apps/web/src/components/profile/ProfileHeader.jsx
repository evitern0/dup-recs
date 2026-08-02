import React from 'react';

export function ProfileHeader({ username }) {
  return (
    <section className="surface stack">
      <h1 style={{ margin: 0 }}>{username}</h1>
      <p className="helper">Chronological history and comments.</p>
    </section>
  );
}
