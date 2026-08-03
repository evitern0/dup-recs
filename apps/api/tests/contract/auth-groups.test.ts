import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { jsonOf, type AuthPayload, type GroupPayload } from '../http.js';
import { startTestServer } from '../test-server.js';

test('registers a user and creates a group', async () => {
  const database = await createDatabase({ adapter: 'pg-mem' });
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', username: 'alice', password: 'secret123' })
    });
    const registerBody = await jsonOf<AuthPayload>(registerResponse);

    assert.equal(registerResponse.status, 201);
    assert.equal(registerBody.user.username, 'alice');
    assert.equal(typeof registerBody.token, 'string');
    assert.match(registerBody.user.id, /^[0-9a-f-]{36}$/i);

    const groupResponse = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${registerBody.token}` },
      body: JSON.stringify({ name: 'Morning Mix' })
    });
    const groupBody = await jsonOf<GroupPayload>(groupResponse);

    assert.equal(groupResponse.status, 201);
    assert.equal(groupBody.group.name, 'Morning Mix');

    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${registerBody.token}` }
    });
    const meBody = await jsonOf<AuthPayload>(meResponse);
    assert.equal(meResponse.status, 200);
    assert.equal(meBody.user.id, registerBody.user.id);
  } finally {
    await close();
    await database.close();
    server.unref();
  }
});
