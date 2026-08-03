# HTTP API Contract: PostgreSQL Persistence Migration

## Contract Intent

This feature preserves the existing public API surface while changing backend storage from in-memory state to PostgreSQL 18.

## Compatibility Requirements

- Existing endpoint paths and methods remain unchanged.
- Existing request and response field semantics remain unchanged.
- Existing membership-based authorization behavior remains unchanged.
- Existing validation behavior (including 255-character limits) remains unchanged.

## Endpoints Covered

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Groups and Membership
- `POST /api/groups`
- `POST /api/groups/:groupId/join`
- `GET /api/groups/:groupId/members`
- `POST /api/groups/:groupId/invites`

### Albums and Posts
- `GET /api/albums/search`
- `POST /api/groups/:groupId/posts`
- `GET /api/groups/:groupId/timeline`
- `GET /api/users/:username/posts`

### Comments
- `GET /api/posts/:postId/comments`
- `POST /api/posts/:postId/comments`

## Storage-Backed Behavior Guarantees

- Records created through API writes are durable across API process restarts.
- Timeline and profile-history responses continue to preserve ordering semantics.
- Invite acceptance and membership creation remain consistent as one user-visible action.

## Error Contract Additions

Storage failures must map to safe, recoverable API errors:

- Startup database connection failure:
  - API does not present a ready state.
  - Startup logs/state report that persistent store initialization failed.
- Runtime database interruption:
  - Affected requests return explicit error responses.
  - Error payloads do not expose credentials, hostnames, or raw SQL internals.
- Operational diagnostics MUST be emitted server-side for storage-related failures with stable event names and redacted sensitive fields.

## ID Contract

- Primary identifiers for persisted entities are UUIDv7 values.
- ID format changes are internal to persistence and must not break route parameter handling or client object identity use.

## Migration Contract

- All DDL changes are tracked as ordered SQL files in `apps/api/migrations`.
- Schema changes are introduced through migrations, not ad hoc runtime mutation.
