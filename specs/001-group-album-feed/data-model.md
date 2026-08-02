# Data Model: Social Music Group Feed

## Entities

### User

- `id`: Unique identifier
- `email`: Login and invitation address
- `username`: Public display name, unique
- `passwordHash`: Stored credential material for local auth
- `createdAt`: Account creation timestamp
- `authProvider`: Optional auth source metadata for Passport strategies

Relationships:

- A user can belong to many groups through memberships.
- A user can author many posts and many comments.
- A user can send many invitations.

Validation rules:

- Email must be present and unique.
- Username must be present, unique, and publicly displayable.
- Password must satisfy the app's auth policy.

### Group

- `id`: Unique identifier
- `name`: Human-readable group name
- `createdByUserId`: User who created the group
- `createdAt`: Creation timestamp

Relationships:

- A group has many memberships.
- A group has many invitations.
- A group has many posts.

Validation rules:

- Group names must be present.
- Membership access controls apply to all group data.

### Membership

- `id`: Unique identifier
- `groupId`: Parent group
- `userId`: Member user
- `role`: Member role such as owner or member
- `joinedAt`: Membership timestamp

Relationships:

- A membership links one user to one group.

Validation rules:

- A user can only have one membership per group.
- Membership is required before viewing group content.

### Invitation

- `id`: Unique identifier
- `groupId`: Target group
- `email`: Invitee email address
- `invitedByUserId`: Sending user
- `token`: Join token or invite identifier
- `status`: Pending, accepted, expired, or revoked
- `createdAt`: Invitation time
- `acceptedAt`: Optional acceptance timestamp

Relationships:

- An invitation belongs to one group.
- An invitation may later resolve to a membership.

Validation rules:

- Email must be present.
- Invitations must be scoped to the group that created them.

### Recommendation Post

- `id`: Unique identifier
- `groupId`: Parent group
- `userId`: Authoring user
- `albumMusicBrainzId`: External album identifier
- `albumTitle`: Snapshot of album title
- `artistName`: Snapshot of artist name
- `releaseYear`: Snapshot of release year
- `albumArtUrl`: Snapshot or resolved artwork URL
- `description`: User-written recommendation text
- `createdAt`: Post timestamp

Relationships:

- A post belongs to one group.
- A post belongs to one user.
- A post has many comments.

Validation rules:

- Description must be present and no more than 255 characters.
- Album metadata must be stored with the post so the timeline remains stable.

### Comment

- `id`: Unique identifier
- `postId`: Parent post
- `userId`: Comment author
- `body`: Comment text
- `createdAt`: Comment timestamp

Relationships:

- A comment belongs to one post.
- A comment belongs to one user.

Validation rules:

- Comment body must be present and no more than 255 characters.
- Only group members may create or view comments for that group's posts.

## Relationship Summary

- User 1..* Membership *..1 Group
- Group 1..* Invitation
- Group 1..* Recommendation Post
- Recommendation Post 1..* Comment
- User 1..* Recommendation Post
- User 1..* Comment

## State Notes

- Invitation lifecycle: pending -> accepted, expired, or revoked.
- Posts and comments are append-only for this feature; editing is out of scope unless added later.
- Timeline ordering is chronological, with recent posts shown first.
