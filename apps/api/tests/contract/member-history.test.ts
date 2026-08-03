import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { startTestServer } from '../test-server.js';

test('member history contract shape', async () => {
  const database = await createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'history-contract@example.com', username: 'history_contract', password: 'secret123' })
    }).then((response) => response.json());

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'History Contract Group' })
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
        description: 'Contract profile post.'
      })
    });

    const historyPayload = await fetch(`${baseUrl}/api/users/${owner.user.username}/posts`, {
      headers: { Authorization: `Bearer ${owner.token}` }
    }).then((response) => response.json());

    assert.equal(historyPayload.user.username, owner.user.username);
    assert.equal(Array.isArray(historyPayload.posts), true);
    assert.equal(typeof historyPayload.posts[0].id, 'string');

    const outsider = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'outsider-history@example.com', username: 'outsider_history', password: 'secret123' })
    }).then((response) => response.json());

    const deniedResponse = await fetch(`${baseUrl}/api/users/${owner.user.username}/posts`, {
      headers: { Authorization: `Bearer ${outsider.token}` }
    });
    assert.equal(deniedResponse.status, 403);
  } finally {
    await close();
    await database.close();
    server.unref();
  }
});
