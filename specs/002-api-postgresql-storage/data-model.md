# Data Model: API PostgreSQL Storage Migration

## Design Goals

- Persist all existing API domain entities in PostgreSQL 18.
- Use UUIDv7 for every primary key.
- Preserve existing domain relationships, authorization boundaries, and validation semantics.
- Ensure every DDL change is represented by a tracked SQL migration file.

## Entity Schemas

### User

Fields:
- `id` (UUIDv7, primary key)
- `email` (text, required, unique, normalized)
- `username` (text, required, unique)
- `password_hash` (text, required)
- `created_at` (timestamptz, required, default now)

Validation rules:
- Email must be unique and present.
- Username must be unique and present.

### Group

Fields:
- `id` (UUIDv7, primary key)
- `name` (text, required)
- `created_by_user_id` (UUIDv7, required, foreign key -> users.id)
- `created_at` (timestamptz, required, default now)

Validation rules:
- Group name must be present.

### Membership

Fields:
- `id` (UUIDv7, primary key)
- `group_id` (UUIDv7, required, foreign key -> groups.id)
- `user_id` (UUIDv7, required, foreign key -> users.id)
- `role` (text, required, default member)
- `joined_at` (timestamptz, required, default now)

Validation rules:
- Unique membership per user per group (`UNIQUE (group_id, user_id)`).

### Invitation

Fields:
- `id` (UUIDv7, primary key)
- `group_id` (UUIDv7, required, foreign key -> groups.id)
- `email` (text, required, normalized)
- `invited_by_user_id` (UUIDv7, required, foreign key -> users.id)
- `token` (text, required, unique)
- `status` (text, required, default pending)
- `created_at` (timestamptz, required, default now)
- `accepted_at` (timestamptz, nullable)

Validation rules:
- Status values constrained to valid invitation lifecycle states.
- Token must be unique.

### Post

Fields:
- `id` (UUIDv7, primary key)
- `group_id` (UUIDv7, required, foreign key -> groups.id)
- `user_id` (UUIDv7, required, foreign key -> users.id)
- `album_musicbrainz_id` (text, required)
- `album_title` (text, required)
- `artist_name` (text, required)
- `release_year` (text, required)
- `album_art_url` (text, required)
- `description` (text, required)
- `created_at` (timestamptz, required, default now)

Validation rules:
- Description length must be <= 255.

### Comment

Fields:
- `id` (UUIDv7, primary key)
- `post_id` (UUIDv7, required, foreign key -> posts.id)
- `user_id` (UUIDv7, required, foreign key -> users.id)
- `body` (text, required)
- `created_at` (timestamptz, required, default now)

Validation rules:
- Comment body must be non-empty and length <= 255.

## Relationships

- User 1..* Membership *..1 Group
- Group 1..* Invitation
- Group 1..* Post
- Post 1..* Comment
- User 1..* Post
- User 1..* Comment

## Index and Access Considerations

- Primary key index on UUIDv7 IDs for all tables.
- Unique indexes for users.email, users.username, invitations.token, and memberships(group_id, user_id).
- Timeline query index on posts(group_id, created_at desc, id desc) to support pagination.
- Comment query index on comments(post_id, created_at asc, id asc).
- Member history index on posts(user_id, created_at asc, id asc).

## State Transitions

- Invitation: pending -> accepted | expired | revoked
- Membership: created at join/ownership grant; removed when member leaves (future behavior)
- Post and Comment: append-only within this feature scope

## Migration and DDL Tracking Rules

- Every schema change is added as a new ordered SQL file in `apps/api/migrations`.
- Existing migration files are immutable once applied to shared environments.
- Migrations include primary key definitions using UUIDv7 and any required constraints/indexes.
- Rollback or forward-fix approach for failed migrations must be documented in change notes.
