import bcrypt from 'bcryptjs';
import { INITIAL_TIMELINE_PAGE_SIZE, MAX_TEXT_LENGTH, TIMELINE_PAGE_SIZE } from '@dup-recs/shared';

function createId(prefix, counter) {
  return `${prefix}_${String(counter).padStart(6, '0')}`;
}

function normalizeQuery(value) {
  return String(value ?? '').trim().toLowerCase();
}

class MemoryDatabase {
  constructor() {
    this.counters = {
      user: 1,
      group: 1,
      membership: 1,
      invite: 1,
      post: 1,
      comment: 1
    };

    this.users = [];
    this.groups = [];
    this.memberships = [];
    this.invites = [];
    this.posts = [];
    this.comments = [];
  }

  nextId(prefix) {
    const current = this.counters[prefix];
    this.counters[prefix] += 1;
    return createId(prefix, current);
  }

  now() {
    return new Date().toISOString();
  }

  createUser({ email, username, password }) {
    const user = {
      id: this.nextId('user'),
      email: normalizeQuery(email),
      username,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: this.now()
    };

    if (this.users.some((entry) => entry.email === user.email)) {
      throw new Error('email already exists');
    }

    if (this.users.some((entry) => normalizeQuery(entry.username) === normalizeQuery(username))) {
      throw new Error('username already exists');
    }

    this.users.push(user);
    return user;
  }

  findUserByEmail(email) {
    return this.users.find((user) => user.email === normalizeQuery(email)) ?? null;
  }

  findUserById(id) {
    return this.users.find((user) => user.id === id) ?? null;
  }

  findUserByUsername(username) {
    return this.users.find((user) => normalizeQuery(user.username) === normalizeQuery(username)) ?? null;
  }

  createGroup({ name, createdByUserId }) {
    const group = {
      id: this.nextId('group'),
      name,
      createdByUserId,
      createdAt: this.now()
    };
    this.groups.push(group);
    this.memberships.push({
      id: this.nextId('membership'),
      groupId: group.id,
      userId: createdByUserId,
      role: 'owner',
      joinedAt: this.now()
    });
    return group;
  }

  findGroupById(groupId) {
    return this.groups.find((group) => group.id === groupId) ?? null;
  }

  getMembership(groupId, userId) {
    return this.memberships.find((membership) => membership.groupId === groupId && membership.userId === userId) ?? null;
  }

  assertMembership(groupId, userId) {
    const membership = this.getMembership(groupId, userId);
    if (!membership) {
      throw new Error('membership required');
    }
    return membership;
  }

  joinGroup({ groupId, userId }) {
    const existing = this.getMembership(groupId, userId);
    if (existing) {
      return existing;
    }

    const membership = {
      id: this.nextId('membership'),
      groupId,
      userId,
      role: 'member',
      joinedAt: this.now()
    };
    this.memberships.push(membership);
    return membership;
  }

  listGroupMembers(groupId) {
    return this.memberships
      .filter((membership) => membership.groupId === groupId)
      .map((membership) => this.findUserById(membership.userId))
      .filter(Boolean)
      .map((user) => ({ id: user.id, username: user.username }));
  }

  createInvite({ groupId, email, invitedByUserId }) {
    const invite = {
      id: this.nextId('invite'),
      groupId,
      email: normalizeQuery(email),
      invitedByUserId,
      token: `invite_${this.counters.invite}`,
      status: 'pending',
      createdAt: this.now(),
      acceptedAt: null
    };
    this.invites.push(invite);
    return invite;
  }

  acceptInvite(token, userId) {
    const invite = this.invites.find((entry) => entry.token === token && entry.status === 'pending');
    if (!invite) {
      throw new Error('invite not found');
    }

    invite.status = 'accepted';
    invite.acceptedAt = this.now();
    return this.joinGroup({ groupId: invite.groupId, userId });
  }

  createPost(input) {
    const description = String(input.description ?? '').trim();
    if (description.length > MAX_TEXT_LENGTH) {
      throw new Error('description too long');
    }

    const post = {
      id: this.nextId('post'),
      groupId: input.groupId,
      userId: input.userId,
      albumMusicBrainzId: input.albumMusicBrainzId,
      albumTitle: input.albumTitle,
      artistName: input.artistName,
      releaseYear: String(input.releaseYear ?? ''),
      albumArtUrl: input.albumArtUrl,
      description,
      createdAt: this.now()
    };

    this.assertMembership(post.groupId, post.userId);
    this.posts.push(post);
    return post;
  }

  listGroupPosts(groupId, { limit = INITIAL_TIMELINE_PAGE_SIZE, cursor } = {}) {
    const ordered = this.posts
      .filter((post) => post.groupId === groupId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    const startIndex = cursor ? ordered.findIndex((post) => post.id === cursor) + 1 : 0;
    const pageSize = Math.min(Number(limit) || INITIAL_TIMELINE_PAGE_SIZE, TIMELINE_PAGE_SIZE);
    const slice = ordered.slice(startIndex, startIndex + pageSize);
    const nextCursor = slice.length === pageSize ? slice[slice.length - 1].id : null;

    return {
      posts: slice.map((post) => this.enrichPost(post)),
      nextCursor
    };
  }

  getPostById(postId) {
    return this.posts.find((post) => post.id === postId) ?? null;
  }

  listCommentsForPost(postId) {
    return this.comments
      .filter((comment) => comment.postId === postId)
      .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
      .map((comment) => ({ ...comment, user: this.findUserById(comment.userId) }));
  }

  addComment({ postId, userId, body }) {
    const post = this.getPostById(postId);
    if (!post) {
      throw new Error('post not found');
    }

    this.assertMembership(post.groupId, userId);

    const text = String(body ?? '').trim();
    if (text.length === 0) {
      throw new Error('comment is required');
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new Error('comment too long');
    }

    const comment = {
      id: this.nextId('comment'),
      postId,
      userId,
      body: text,
      createdAt: this.now()
    };
    this.comments.push(comment);
    return comment;
  }

  listUserPosts(username) {
    const user = this.findUserByUsername(username);
    if (!user) {
      return null;
    }

    const posts = this.posts
      .filter((post) => post.userId === user.id)
      .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
      .map((post) => this.enrichPost(post));

    return { user: { id: user.id, username: user.username }, posts };
  }

  enrichPost(post) {
    const user = this.findUserById(post.userId);
    return {
      ...post,
      author: user ? { id: user.id, username: user.username } : null,
      comments: this.listCommentsForPost(post.id)
    };
  }

  searchAlbum(query, type = 'album') {
    const q = normalizeQuery(query);
    const demoResults = [
      {
        albumMusicBrainzId: 'mbid-demo-1',
        albumTitle: 'Blue Train',
        artistName: 'John Coltrane',
        releaseYear: '1957',
        albumArtUrl: 'https://dummyimage.com/600x600/ddd/111&text=Blue+Train'
      },
      {
        albumMusicBrainzId: 'mbid-demo-2',
        albumTitle: 'Abbey Road',
        artistName: 'The Beatles',
        releaseYear: '1969',
        albumArtUrl: 'https://dummyimage.com/600x600/ddd/111&text=Abbey+Road'
      },
      {
        albumMusicBrainzId: 'mbid-demo-3',
        albumTitle: 'To Pimp a Butterfly',
        artistName: 'Kendrick Lamar',
        releaseYear: '2015',
        albumArtUrl: 'https://dummyimage.com/600x600/ddd/111&text=TPAB'
      }
    ];

    return demoResults.filter((entry) => {
      if (!q) {
        return true;
      }
      return normalizeQuery(type) === 'artist'
        ? normalizeQuery(entry.artistName).includes(q)
        : normalizeQuery(entry.albumTitle).includes(q) || normalizeQuery(entry.artistName).includes(q);
    });
  }
}

export function createDatabase() {
  return new MemoryDatabase();
}

export const database = createDatabase();
