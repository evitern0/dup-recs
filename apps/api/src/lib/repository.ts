import { INITIAL_TIMELINE_PAGE_SIZE, MAX_TEXT_LENGTH, TIMELINE_PAGE_SIZE } from '@dup-recs/shared';
import { v7 as uuidv7 } from 'uuid';
import { AppError, mapDatabaseError, normalizeQuery, withTransaction } from './sql.js';
import { hashPassword } from './password.js';

function toUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

function toGroup(row) {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    name: row.name,
    createdByUserId: String(row.created_by_user_id),
    createdAt: row.created_at
  };
}

function toMembership(row) {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    groupId: String(row.group_id),
    userId: String(row.user_id),
    role: row.role,
    joinedAt: row.joined_at
  };
}

function toInvite(row) {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    groupId: String(row.group_id),
    email: row.email,
    invitedByUserId: String(row.invited_by_user_id),
    token: row.token,
    status: row.status,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at
  };
}

function toPost(row) {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    groupId: String(row.group_id),
    userId: String(row.user_id),
    albumMusicBrainzId: row.album_musicbrainz_id,
    albumTitle: row.album_title,
    artistName: row.artist_name,
    releaseYear: row.release_year,
    albumArtUrl: row.album_art_url,
    description: row.description,
    createdAt: row.created_at
  };
}

function toComment(row) {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    postId: String(row.post_id),
    userId: String(row.user_id),
    body: row.body,
    createdAt: row.created_at
  };
}

export function createRepository(pool) {
  async function createUser({ email, username, password }) {
    const id = uuidv7();
    const normalizedEmail = normalizeQuery(email);
    const passwordHash = hashPassword(password);

    try {
      const { rows } = await pool.query(
        `INSERT INTO users (id, email, username, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, password_hash, created_at`,
        [id, normalizedEmail, username, passwordHash]
      );
      return toUser(rows[0]);
    } catch (error) {
      if (error?.code === '23505') {
        const detail = String(error?.detail ?? '').toLowerCase();
        if (detail.includes('email')) {
          throw new AppError('email already exists', 409, 'EMAIL_EXISTS');
        }
        if (detail.includes('username')) {
          throw new AppError('username already exists', 409, 'USERNAME_EXISTS');
        }
      }
      throw mapDatabaseError(error);
    }
  }

  async function findUserByEmail(email) {
    const { rows } = await pool.query(
      `SELECT id, email, username, password_hash, created_at
       FROM users WHERE email = $1`,
      [normalizeQuery(email)]
    );
    return toUser(rows[0]);
  }

  async function findUserById(id) {
    const { rows } = await pool.query(
      `SELECT id, email, username, password_hash, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return toUser(rows[0]);
  }

  async function findUserByUsername(username) {
    const { rows } = await pool.query(
      `SELECT id, email, username, password_hash, created_at
       FROM users WHERE LOWER(username) = $1`,
      [normalizeQuery(username)]
    );
    return toUser(rows[0]);
  }

  async function createGroup({ name, createdByUserId }) {
    return withTransaction(pool, async (tx) => {
      const groupId = uuidv7();
      const membershipId = uuidv7();

      const groupInsert = await tx.query(
        `INSERT INTO groups (id, name, created_by_user_id)
         VALUES ($1, $2, $3)
         RETURNING id, name, created_by_user_id, created_at`,
        [groupId, name, createdByUserId]
      );

      await tx.query(
        `INSERT INTO memberships (id, group_id, user_id, role)
         VALUES ($1, $2, $3, $4)`,
        [membershipId, groupId, createdByUserId, 'owner']
      );

      return toGroup(groupInsert.rows[0]);
    });
  }

  async function findGroupById(groupId) {
    const { rows } = await pool.query(
      `SELECT id, name, created_by_user_id, created_at
       FROM groups WHERE id = $1`,
      [groupId]
    );
    return toGroup(rows[0]);
  }

  async function getMembership(groupId, userId) {
    const { rows } = await pool.query(
      `SELECT id, group_id, user_id, role, joined_at
       FROM memberships
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );
    return toMembership(rows[0]);
  }

  async function assertMembership(groupId, userId) {
    const membership = await getMembership(groupId, userId);
    if (!membership) {
      throw new AppError('membership required', 403, 'MEMBERSHIP_REQUIRED');
    }
    return membership;
  }

  async function joinGroup({ groupId, userId }) {
    const existing = await getMembership(groupId, userId);
    if (existing) {
      return existing;
    }

    const { rows } = await pool.query(
      `INSERT INTO memberships (id, group_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, group_id, user_id, role, joined_at`,
      [uuidv7(), groupId, userId, 'member']
    );

    return toMembership(rows[0]);
  }

  async function listGroupMembers(groupId) {
    const { rows } = await pool.query(
      `SELECT users.id, users.username
       FROM memberships
       JOIN users ON users.id = memberships.user_id
       WHERE memberships.group_id = $1
       ORDER BY users.username ASC`,
      [groupId]
    );

    return rows.map((row) => ({ id: String(row.id), username: row.username }));
  }

  async function createInvite({ groupId, email, invitedByUserId }) {
    const token = `invite_${uuidv7()}`;

    const { rows } = await pool.query(
      `INSERT INTO invitations (id, group_id, email, invited_by_user_id, token, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, group_id, email, invited_by_user_id, token, status, created_at, accepted_at`,
      [uuidv7(), groupId, normalizeQuery(email), invitedByUserId, token]
    );

    return toInvite(rows[0]);
  }

  async function acceptInvite(token, userId) {
    return withTransaction(pool, async (tx) => {
      const inviteResult = await tx.query(
        `SELECT id, group_id, email, invited_by_user_id, token, status, created_at, accepted_at
         FROM invitations
         WHERE token = $1 AND status = 'pending'
         FOR UPDATE`,
        [token]
      );

      if (inviteResult.rows.length === 0) {
        throw new AppError('invite not found', 404, 'INVITE_NOT_FOUND');
      }

      const invite = toInvite(inviteResult.rows[0]);

      await tx.query(
        `UPDATE invitations
         SET status = 'accepted', accepted_at = NOW()
         WHERE id = $1`,
        [invite.id]
      );

      const existing = await tx.query(
        `SELECT id, group_id, user_id, role, joined_at
         FROM memberships
         WHERE group_id = $1 AND user_id = $2`,
        [invite.groupId, userId]
      );

      if (existing.rows.length > 0) {
        return toMembership(existing.rows[0]);
      }

      const membership = await tx.query(
        `INSERT INTO memberships (id, group_id, user_id, role)
         VALUES ($1, $2, $3, 'member')
         RETURNING id, group_id, user_id, role, joined_at`,
        [uuidv7(), invite.groupId, userId]
      );

      return toMembership(membership.rows[0]);
    });
  }

  async function createPost(input) {
    const description = String(input.description ?? '').trim();
    if (description.length > MAX_TEXT_LENGTH) {
      throw new AppError('description too long', 400, 'DESCRIPTION_TOO_LONG');
    }

    await assertMembership(input.groupId, input.userId);

    const { rows } = await pool.query(
      `INSERT INTO posts (
         id, group_id, user_id, album_musicbrainz_id,
         album_title, artist_name, release_year, album_art_url, description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, group_id, user_id, album_musicbrainz_id,
                 album_title, artist_name, release_year, album_art_url, description, created_at`,
      [
        uuidv7(),
        input.groupId,
        input.userId,
        input.albumMusicBrainzId,
        input.albumTitle,
        input.artistName,
        String(input.releaseYear ?? ''),
        input.albumArtUrl,
        description
      ]
    );

    return toPost(rows[0]);
  }

  async function getPostById(postId) {
    const { rows } = await pool.query(
      `SELECT id, group_id, user_id, album_musicbrainz_id,
              album_title, artist_name, release_year, album_art_url, description, created_at
       FROM posts WHERE id = $1`,
      [postId]
    );
    return toPost(rows[0]);
  }

  async function listCommentsForPost(postId) {
    const { rows } = await pool.query(
      `SELECT comments.id, comments.post_id, comments.user_id, comments.body, comments.created_at,
              users.id AS author_id, users.username AS author_username
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at ASC, comments.id ASC`,
      [postId]
    );

    return rows.map((row) => ({
      ...toComment(row),
      user: {
        id: String(row.author_id),
        username: row.author_username
      }
    }));
  }

  async function enrichPost(post) {
    const author = await findUserById(post.userId);
    const comments = await listCommentsForPost(post.id);

    return {
      ...post,
      author: author ? { id: author.id, username: author.username } : null,
      comments
    };
  }

  async function listGroupPosts(
    groupId,
    { limit = INITIAL_TIMELINE_PAGE_SIZE, cursor }: { limit?: number; cursor?: string } = {}
  ) {
    const pageSize = Math.min(Number(limit) || INITIAL_TIMELINE_PAGE_SIZE, TIMELINE_PAGE_SIZE);
    let cursorCreatedAt = null;

    if (cursor) {
      const cursorPost = await getPostById(cursor);
      cursorCreatedAt = cursorPost?.createdAt ?? null;
    }

    const params = [groupId, pageSize];
    let cursorClause = '';

    if (cursor && cursorCreatedAt) {
      params.push(cursorCreatedAt, cursor);
      cursorClause = 'AND (created_at, id) < ($3::timestamptz, $4::uuid)';
    }

    const { rows } = await pool.query(
      `SELECT id, group_id, user_id, album_musicbrainz_id,
              album_title, artist_name, release_year, album_art_url, description, created_at
       FROM posts
       WHERE group_id = $1
       ${cursorClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $2`,
      params
    );

    const posts = await Promise.all(rows.map(async (row) => enrichPost(toPost(row))));
    const nextCursor = posts.length === pageSize ? posts[posts.length - 1].id : null;

    return {
      posts,
      nextCursor
    };
  }

  async function addComment({ postId, userId, body }) {
    const post = await getPostById(postId);
    if (!post) {
      throw new AppError('post not found', 404, 'POST_NOT_FOUND');
    }

    await assertMembership(post.groupId, userId);

    const text = String(body ?? '').trim();
    if (text.length === 0) {
      throw new AppError('comment is required', 400, 'COMMENT_REQUIRED');
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new AppError('comment too long', 400, 'COMMENT_TOO_LONG');
    }

    const { rows } = await pool.query(
      `INSERT INTO comments (id, post_id, user_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, post_id, user_id, body, created_at`,
      [uuidv7(), postId, userId, text]
    );

    return toComment(rows[0]);
  }

  async function listUserPosts(username) {
    const user = await findUserByUsername(username);
    if (!user) {
      return null;
    }

    const { rows } = await pool.query(
      `SELECT id, group_id, user_id, album_musicbrainz_id,
              album_title, artist_name, release_year, album_art_url, description, created_at
       FROM posts
       WHERE user_id = $1
       ORDER BY created_at ASC, id ASC`,
      [user.id]
    );

    const posts = await Promise.all(rows.map(async (row) => enrichPost(toPost(row))));
    return {
      user: { id: user.id, username: user.username },
      posts
    };
  }

  return {
    createUser,
    findUserByEmail,
    findUserById,
    findUserByUsername,
    createGroup,
    findGroupById,
    getMembership,
    assertMembership,
    joinGroup,
    listGroupMembers,
    createInvite,
    acceptInvite,
    createPost,
    listGroupPosts,
    getPostById,
    listCommentsForPost,
    addComment,
    listUserPosts,
    enrichPost
  };
}
