import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { startTestServer } from '../test-server.js';

test('creates invites and comments on posts', async () => {
  const database = createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', username: 'owner', password: 'secret123' })
    }).then((response) => response.json());

    const member = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@example.com', username: 'member', password: 'secret123' })
    }).then((response) => response.json());

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'Listening Club' })
    }).then((response) => response.json());

    const invite = await fetch(`${baseUrl}/api/groups/${group.group.id}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ email: 'member@example.com' })
    }).then((response) => response.json());

    const joined = await fetch(`${baseUrl}/api/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ inviteToken: invite.invitation.token })
    }).then((response) => response.json());

    assert.equal(joined.membership.groupId, group.group.id);

    const post = await fetch(`${baseUrl}/api/groups/${group.group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({
        albumMusicBrainzId: 'mbid-demo-1',
        albumTitle: 'Blue Train',
        artistName: 'John Coltrane',
        releaseYear: '1957',
        albumArtUrl: 'https://dummyimage.com/600x600',
        description: 'Blue-note classic.'
      })
    }).then((response) => response.json());

    const comment = await fetch(`${baseUrl}/api/posts/${post.post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ body: 'Great pick.' })
    }).then((response) => response.json());

    assert.equal(comment.comment.body, 'Great pick.');
  } finally {
    await close();
    server.unref();
  }
});
