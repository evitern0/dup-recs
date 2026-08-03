import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/lib/db.js';
import { jsonOf, type AuthPayload, type GroupPayload, type InvitationPayload, type PostPayload, type CommentPayload } from '../http.js';
import { startTestServer } from '../test-server.js';

test('invite and comments contract shape', async () => {
  const database = await createDatabase();
  const { server, baseUrl, close } = await startTestServer(createApp(database));

  try {
    const owner = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner-contract@example.com', username: 'owner_contract', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const member = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member-contract@example.com', username: 'member_contract', password: 'secret123' })
    }).then((response) => jsonOf<AuthPayload>(response));

    const group = await fetch(`${baseUrl}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: 'Contract Group' })
    }).then((response) => jsonOf<GroupPayload>(response));

    const invitePayload = await fetch(`${baseUrl}/api/groups/${group.group.id}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ email: 'member-contract@example.com' })
    }).then((response) => jsonOf<InvitationPayload>(response));

    assert.equal(typeof invitePayload.invitation.id, 'string');
    assert.equal(invitePayload.invitation.groupId, group.group.id);
    assert.equal(invitePayload.invitation.status, 'pending');
    assert.equal(typeof invitePayload.invitation.token, 'string');

    await fetch(`${baseUrl}/api/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ inviteToken: invitePayload.invitation.token })
    });

    const postPayload = await fetch(`${baseUrl}/api/groups/${group.group.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({
        albumMusicBrainzId: 'mbid-demo-1',
        albumTitle: 'Blue Train',
        artistName: 'John Coltrane',
        releaseYear: '1957',
        albumArtUrl: 'https://dummyimage.com/600x600',
        description: 'Contract post.'
      })
    }).then((response) => jsonOf<PostPayload>(response));

    const commentPayload = await fetch(`${baseUrl}/api/posts/${postPayload.post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ body: 'Contract comment.' })
    }).then((response) => jsonOf<CommentPayload>(response));

    assert.equal(typeof commentPayload.comment.id, 'string');
    assert.equal(commentPayload.comment.postId, postPayload.post.id);
    assert.equal(commentPayload.comment.body, 'Contract comment.');
  } finally {
    await close();
    await database.close();
    server.unref();
  }
});
