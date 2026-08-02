# Quickstart: Social Music Group Feed

## Purpose

Validate the feature end to end after implementation.

## Prerequisites

- A Node.js runtime and a PostgreSQL database.
- Backend and frontend apps configured with the same auth and database settings.
- Passport auth credentials and JWT secret configured.
- MusicBrainz search configured through `node-musicbrainz`.

## Setup

1. Install dependencies for the backend, frontend, and shared packages.
2. Configure environment variables for PostgreSQL, JWT, Passport, and MusicBrainz.
3. Start the API server.
4. Start the frontend app.

## Validation Scenarios

### 1. Authentication Gate

- Open the landing page while logged out.
- Confirm the page requires login or registration.

Expected result: unauthenticated users cannot reach the group timeline.

### 2. Register and Join a Group

- Register using email, public username, and password.
- Create a group or join a group through an invitation flow.

Expected result: the user lands in the group experience and sees group-scoped content.

### 3. Invite Another User

- Open the group page.
- Send an email invitation to another person.

Expected result: the invite is recorded for that group.

### 4. Create a New Recommendation

- Click New Rec.
- Search for an album by album title or artist name.
- Select a result and submit a description with at most 255 characters.

Expected result: the new post appears in the group timeline immediately after submission.

### 5. Load More Timeline Items

- Scroll the timeline after the first 10 posts are visible.

Expected result: the next 10 posts load and preserve chronological ordering.

### 6. Comment on a Post

- Expand the hidden comment area on a post.
- Add a comment as a group member.

Expected result: the comment is saved, rendered with the post, and visible to other members.

### 7. Open a Member Profile

- Click another username from the group member list.

Expected result: the profile page shows only that user's posts in chronological order with comments attached.

## Contract References

- API shapes are defined in [contracts/http-api.md](contracts/http-api.md).
- UI behavior is defined in [contracts/ui-behavior.md](contracts/ui-behavior.md).
- Data relationships and validation rules are defined in [data-model.md](data-model.md).
