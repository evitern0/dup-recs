import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { startTestServer } from '../test-server.js';

test('searches albums and paginates the timeline', async () => {
  const database = await createDatabase();
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
    await database.close();
    server.unref();
  }
});

test('keeps timeline data after API restart', async () => {
  const database = await createDatabase();
  const first = await startTestServer(createApp(database));

  try {
    const register = await fetch(`${first.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'restart-owner@example.com', username: 'restart_owner', password: 'secret123' })
    }).then((response) => response.json());

    const group = await fetch(`${first.baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${register.token}` },
      body: JSON.stringify({ name: 'Restart Club' })
    }).then((response) => response.json());

    await fetch(`${first.baseUrl}/api/groups/${group.group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${register.token}` },
      body: JSON.stringify({
        albumMusicBrainzId: 'mbid-demo-1',
        albumTitle: 'Blue Train',
        artistName: 'John Coltrane',
        releaseYear: '1957',
        albumArtUrl: 'https://dummyimage.com/600x600',
        description: 'Restart durability record.'
      })
    });

    await first.close();
    first.server.unref();

    const second = await startTestServer(createApp(database));
    try {
      const timeline = await fetch(`${second.baseUrl}/api/groups/${group.group.id}/timeline?limit=10`, {
        headers: { Authorization: `Bearer ${register.token}` }
      }).then((response) => response.json());

      assert.equal(timeline.posts.length > 0, true);
      assert.equal(timeline.posts[0].description, 'Restart durability record.');
    } finally {
      await second.close();
      second.server.unref();
    }
  } finally {
    await database.close();
  }
});

test('fails fast when DATABASE_URL is missing at startup', async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousNodeEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    const { buildServer } = await import('../../src/index.js');

    await assert.rejects(async () => {
      await buildServer();
    }, /DATABASE_URL is required/);
  } finally {
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});
