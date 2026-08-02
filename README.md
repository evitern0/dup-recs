# dup-recs

dup-recs is a social music app for private groups. Users register with email, a public username, and a password, then create or join a group, invite others by email, share album recommendations, and comment on posts from other members.

## What’s Included

- Group-based album recommendation timelines
- Email invitations to join a group
- MusicBrainz-backed album search for new recommendations
- Comments on posts with hidden-by-default comment threads
- Member profile views that show a user’s posts in chronological order
- A shared contract package for cross-app types and validation rules

## Tech Stack

- Backend: TypeScript, Node.js, Express.js, Passport.js, JWT, PostgreSQL
- Album search: `node-musicbrainz`
- Frontend: React, React Router, Vite
- Shared code: `packages/shared` for constants, validators, and basic shapes

## Repository Layout

```text
apps/
├── api/        # Express API, auth, routes, persistence, and tests
└── web/        # React UI, pages, components, and browser tests

packages/
└── shared/     # Cross-cutting constants, validators, and shared shapes

specs/          # Spec Kit documents
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- `pnpm`
- PostgreSQL 18

### Install

```bash
pnpm install
```

### Environment

Set the server environment variables required by the API before running it locally.

- `PORT`: API port, defaults to `3001`
- `JWT_SECRET`: secret used to sign JWTs
- Any PostgreSQL connection settings used by your database layer
- Any Passport OAuth provider settings you enable
- Any MusicBrainz configuration required by your album search integration

### Run the Apps

```bash
pnpm dev
```

This starts the API and web apps using the workspace scripts defined in the root `package.json`.

### Run Tests

```bash
pnpm test
```

## Available Scripts

From the repository root:

- `pnpm dev` - start the API and web apps
- `pnpm test` - run the workspace test commands
- `pnpm lint` - run linting across the workspace, if configured in each package

## Feature Behavior

The current feature set is defined in [specs/001-group-album-feed/spec.md](specs/001-group-album-feed/spec.md). In short:

- Unauthenticated visitors must log in or register first.
- Group members can create or join a group, invite others, and browse a chronological timeline of recent recommendations.
- Each recommendation stores album metadata so the feed can render consistently.
- Comments are hidden by default and can be expanded per post.
- Clicking a group member’s username opens that user’s profile history.

## Documentation

- [Feature spec](specs/001-group-album-feed/spec.md)
- [Implementation plan](specs/001-group-album-feed/plan.md)
- [Data model](specs/001-group-album-feed/data-model.md)
- [Quickstart](specs/001-group-album-feed/quickstart.md)
- [HTTP contract](specs/001-group-album-feed/contracts/http-api.md)
- [UI behavior contract](specs/001-group-album-feed/contracts/ui-behavior.md)

## Notes

- The monorepo is intentionally split into API, web, and shared packages so common validation and contract rules can stay aligned.
- The app is designed to stay mobile-first and lightweight on the frontend while keeping membership checks enforced on the server.
