import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { startTestServer } from '../test-server.js';

test('loads a member profile history in chronological order', async () => {
  const database = createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', username: 'owner', password: 'secret123' })
    }).then((response) => response.json());

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'History Club' })
    }).then((response) => response.json());

    await fetch(`${baseUrl}/api/groups/${group.group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({
        albumMusicBrainzId: 'mbid-demo-2',
        albumTitle: 'Abbey Road',
        artistName: 'The Beatles',
        releaseYear: '1969',
        albumArtUrl: 'https://dummyimage.com/600x600',
        description: 'Perfect running album.'
      })
    });

    const profile = await fetch(`${baseUrl}/api/users/owner/posts`, {
      headers: { Authorization: `Bearer ${owner.token}` }
    }).then((response) => response.json());

    assert.equal(profile.user.username, 'owner');
    assert.equal(profile.posts.length, 1);
  } finally {
    await close();
    server.unref();
  }
});
