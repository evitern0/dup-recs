# HTTP API Contract

## Authentication

All endpoints except registration and login require `Authorization: Bearer <JWT>`.

## Auth Endpoints

### `POST /api/auth/register`

Registers a new user with email, username, and password.

Request body:

- `email`
- `username`
- `password`

Response:

- `user`
- `token`

### `POST /api/auth/login`

Authenticates an existing user and returns a JWT.

Request body:

- `email`
- `password`

Response:

- `user`
- `token`

## Group Endpoints

### `POST /api/groups`

Creates a new group for the authenticated user.

Response:

- `group`
- `membership`

### `POST /api/groups/:groupId/join`

Joins a group, typically using an invite token or invite-linked flow.

Request body:

- `inviteToken` when required

Response:

- `membership`

### `GET /api/groups/:groupId/members`

Returns the usernames of other users in the authenticated user's group.

Response:

- `members[]` with `id` and `username`

### `POST /api/groups/:groupId/invites`

Invites another person to the group by email.

Request body:

- `email`

Response:

- `invitation`

## Album Search and Posts

### `GET /api/albums/search`

Searches MusicBrainz by album title or artist name.

Query parameters:

- `query`
- `type` with values such as `album` or `artist`

Response:

- `results[]` containing album title, artist, year, artwork reference, and MusicBrainz identifier

### `POST /api/groups/:groupId/posts`

Creates a new recommendation post for the selected album.

Request body:

- `albumMusicBrainzId`
- `albumTitle`
- `artistName`
- `releaseYear`
- `albumArtUrl`
- `description`

Response:

- `post`

### `GET /api/groups/:groupId/timeline`

Returns the group timeline in chronological order with recent posts first.

Query parameters:

- `cursor`
- `limit` defaulting to 10

Response:

- `posts[]`
- `nextCursor`

### `GET /api/users/:username/posts`

Returns one user's posts in chronological order with comments attached.

Response:

- `user`
- `posts[]`

## Comments

### `GET /api/posts/:postId/comments`

Returns comments for a specific post.

Response:

- `comments[]`

### `POST /api/posts/:postId/comments`

Adds a new comment to a post.

Request body:

- `body`

Response:

- `comment`

## Contract Rules

- Posts and comments must enforce the 255-character limit server-side.
- Group membership must be validated before any group-scoped read or write.
- Timeline responses must preserve ordering when the user paginates.
- Post payloads must include album metadata needed to render the feed without re-querying MusicBrainz.
