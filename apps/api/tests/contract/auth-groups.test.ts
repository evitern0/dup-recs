import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { startTestServer } from '../test-server.js';

test('registers a user and creates a group', async () => {
  const database = createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', username: 'alice', password: 'secret123' })
    });
    const registerBody = await registerResponse.json();

    assert.equal(registerResponse.status, 201);
    assert.equal(registerBody.user.username, 'alice');
    assert.equal(typeof registerBody.token, 'string');

    const groupResponse = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${registerBody.token}` },
      body: JSON.stringify({ name: 'Morning Mix' })
    });
    const groupBody = await groupResponse.json();

    assert.equal(groupResponse.status, 201);
    assert.equal(groupBody.group.name, 'Morning Mix');
  } finally {
    await close();
    server.unref();
  }
});
