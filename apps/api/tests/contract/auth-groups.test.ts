import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { jsonOf, type AuthPayload, type GroupPayload, type UserGroupsPayload } from '../http.js';
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

test('lists the authenticated users groups for routing', async () => {
  const database = await createDatabase({ adapter: 'pg-mem' });
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'route-owner@example.com', username: 'route_owner', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const member = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'route-member@example.com', username: 'route_member', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const firstGroup = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'Alpha Group' })
    }).then((response) => jsonOf<GroupPayload>(response));

    const secondGroup = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'Beta Group' })
    }).then((response) => jsonOf<GroupPayload>(response));

    await fetch(`${baseUrl}/api/groups/${firstGroup.group.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({})
    });

    const mineResponse = await fetch(`${baseUrl}/api/groups/mine`, {
      headers: { Authorization: `Bearer ${owner.token}` }
    });
    const mineBody = await jsonOf<UserGroupsPayload>(mineResponse);

    assert.equal(mineResponse.status, 200);
    assert.deepEqual(mineBody.groups.map((group) => group.name), ['Alpha Group', 'Beta Group']);

    const memberResponse = await fetch(`${baseUrl}/api/groups/mine`, {
      headers: { Authorization: `Bearer ${member.token}` }
    });
    const memberBody = await jsonOf<UserGroupsPayload>(memberResponse);

    assert.equal(memberResponse.status, 200);
    assert.equal(memberBody.groups.length, 1);
    assert.equal(memberBody.groups[0].name, 'Alpha Group');
  } finally {
    await close();
    await database.close();
    server.unref();
  }
});
