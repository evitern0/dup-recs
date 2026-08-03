import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { jsonOf, type AuthPayload, type GroupPayload, type InvitationPayload, type MembershipPayload, type PostPayload, type CommentPayload, type ErrorPayload } from '../http.js';
import { startTestServer } from '../test-server.js';

test('creates invites and comments on posts', async () => {
  const database = await createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', username: 'owner', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const member = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@example.com', username: 'member', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'Listening Club' })
    }).then((response) => jsonOf<GroupPayload>(response));

    const invite = await fetch(`${baseUrl}/api/groups/${group.group.id}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ email: 'member@example.com' })
    }).then((response) => jsonOf<InvitationPayload>(response));

    const joined = await fetch(`${baseUrl}/api/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ inviteToken: invite.invitation.token })
    }).then((response) => jsonOf<MembershipPayload>(response));

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
    }).then((response) => jsonOf<PostPayload>(response));

    const comment = await fetch(`${baseUrl}/api/posts/${post.post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ body: 'Great pick.' })
    }).then((response) => jsonOf<CommentPayload>(response));

    assert.equal(comment.comment.body, 'Great pick.');
  } finally {
    await close();
    await database.close();
    server.unref();
  }
});

test('returns safe failure response and emits diagnostics when storage is interrupted', async () => {
  const database = await createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));
  const originalConsoleError = console.error;
  const errorEvents = [];

  console.error = (...args) => {
    errorEvents.push(args.join(' '));
  };

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'failure-owner@example.com', username: 'failure_owner', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'Failure Club' })
    }).then((response) => jsonOf<GroupPayload>(response));

    const post = await fetch(`${baseUrl}/api/groups/${group.group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({
        albumMusicBrainzId: 'mbid-demo-1',
        albumTitle: 'Blue Train',
        artistName: 'John Coltrane',
        releaseYear: '1957',
        albumArtUrl: 'https://dummyimage.com/600x600',
        description: 'Failure simulation.'
      })
    }).then((response) => jsonOf<PostPayload>(response));

    const originalAddComment = database.addComment;
    database.addComment = async () => {
      throw new Error('simulated database outage');
    };

    const interrupted = await fetch(`${baseUrl}/api/posts/${post.post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ body: 'Should fail while DB is unavailable.' })
    });

    const interruptedBody = await jsonOf<ErrorPayload>(interrupted);
    assert.equal(interrupted.status >= 400, true);
    assert.equal(typeof interruptedBody.error, 'string');
    assert.equal(errorEvents.some((entry) => entry.includes('_failed') || entry.includes('database')), true);

    database.addComment = originalAddComment;
  } finally {
    console.error = originalConsoleError;
    await close();
    server.unref();
  }
});
