# HTTP API Contract

## Authentication

All authenticated endpoints continue to require `Authorization: Bearer <JWT>`.

## Auth Endpoints

### `POST /api/auth/register`

Registers a new user with email, username, and password.

Response:

- `user`
- `token`

### `POST /api/auth/login`

Authenticates an existing user and returns a JWT.

Response:

- `user`
- `token`

Contract note:
- The web app may follow login with a membership lookup to determine whether to route to a group timeline or to group management.

### `GET /api/auth/me`

Returns the authenticated user.

Response:

- `user`

## Group Management Endpoints

### `GET /api/groups/mine`

Returns the groups the authenticated user belongs to, in a shape suitable for the group-management page and login routing.

Response:

- `groups[]` with `id` and `name`
- optional routing metadata if the implementation needs it, provided it remains stable and membership-scoped

Contract rules:
- Only groups the authenticated user belongs to may be returned.
- The response must be complete enough for the web app to decide between management routing and direct timeline routing.

## Existing Group Endpoints

### `POST /api/groups`

Creates a new group for the authenticated user.

Response:

- `group`
- `membership`

### `POST /api/groups/join`

Joins a group using an invite token.

Request body:

- `inviteToken`

Response:

- `membership`

### `GET /api/groups/:groupId/timeline`

Returns the group timeline for an accessible group.

Query parameters:

- `cursor`
- `limit`

### `GET /api/groups/:groupId/members`

Returns the other members in an accessible group.

Response:

- `members[]`

## Contract Rules

- Membership summary data must not expose groups the authenticated user does not belong to.
- Login routing must be derived from current membership state, not stale client state.
- The management page must not require a special one-time onboarding flow; it must remain reachable after login.
