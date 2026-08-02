import React from 'react';
import { Link } from 'react-router-dom';

export function GroupMemberList({ members = [] }) {
  return (
    <section className="card stack">
      <h3 className="section-title">Group members</h3>
      <div className="row">
        {members.map((member) => (
          <Link key={member.id} className="member-chip" to={`/users/${member.username}`}>
            {member.username}
          </Link>
        ))}
      </div>
    </section>
  );
}
