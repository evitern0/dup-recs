BEGIN;

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS invitations;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id),
  email TEXT NOT NULL,
  invited_by_user_id UUID NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id UUID NOT NULL REFERENCES users(id),
  album_musicbrainz_id TEXT NOT NULL,
  album_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_year TEXT NOT NULL,
  album_art_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (char_length(description) <= 255)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (char_length(body) > 0),
  CHECK (char_length(body) <= 255)
);

COMMIT;
