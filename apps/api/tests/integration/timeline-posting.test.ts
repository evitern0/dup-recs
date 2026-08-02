import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { startTestServer } from '../test-server.js';

test('searches albums and paginates the timeline', async () => {
  const database = createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const register = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bill@example.com', username: 'bill', password: 'secret123' })
    }).then((response) => response.json());

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${register.token}` },
      body: JSON.stringify({ name: 'Jazz Friends' })
    }).then((response) => response.json());

    const search = await fetch(`${baseUrl}/api/albums/search?query=blue&type=album`, {
      headers: { Authorization: `Bearer ${register.token}` }
    }).then((response) => response.json());

    assert.ok(search.results.length > 0);

    await fetch(`${baseUrl}/api/groups/${group.group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${register.token}` },
      body: JSON.stringify({
        albumMusicBrainzId: search.results[0].albumMusicBrainzId,
        albumTitle: search.results[0].albumTitle,
        artistName: search.results[0].artistName,
        releaseYear: search.results[0].releaseYear,
        albumArtUrl: search.results[0].albumArtUrl,
        description: 'Classic session to revisit.'
      })
    });

    const timeline = await fetch(`${baseUrl}/api/groups/${group.group.id}/timeline?limit=10`, {
      headers: { Authorization: `Bearer ${register.token}` }
    }).then((response) => response.json());

    assert.equal(Array.isArray(timeline.posts), true);
    assert.equal(timeline.posts[0].description, 'Classic session to revisit.');
  } finally {
    await close();
    server.unref();
  }
});
