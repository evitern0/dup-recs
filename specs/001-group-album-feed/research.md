# Research: Social Music Group Feed

## 1. Monorepo Layout

- Decision: Use `apps/api`, `apps/web`, and `packages/shared`.
- Rationale: The backend, frontend, and shared validation/types are distinct boundaries, but they still need common contracts for auth, posts, and comments.
- Alternatives considered: A single app directory would blur the API and UI boundaries; separate repositories would make shared contracts and synchronized feature work harder.

## 2. Backend Architecture

- Decision: Build the server with TypeScript, Express.js on Node.js, PostgreSQL persistence, Passport.js for auth middleware, JWT for API authorization, and node-musicbrainz for album search.
- Rationale: This matches the requested stack and cleanly supports registration, authenticated group access, and album discovery by artist or title.
- Alternatives considered: A session-cookie-only approach would be simpler for browser state but would not fit the requested JWT-based API model; hand-rolling MusicBrainz HTTP requests would work but would duplicate library behavior and increase surface area.

## 3. Auth Flow

- Decision: Use Passport as the middleware boundary around registration/login flows, support OAuth strategies where needed, and issue JWTs for authenticated API calls.
- Rationale: Passport can centralize the auth strategies while JWT keeps the frontend and backend loosely coupled, and OAuth support preserves the requested auth middleware model.
- Alternatives considered: OAuth-only login would not satisfy the email/username/password registration flow; server-rendered session auth would make the API and frontend less portable.

## 4. Album Search and Post Snapshotting

- Decision: Search MusicBrainz by album title or artist name and store a snapshot of album metadata with each recommendation post.
- Rationale: Posts need stable album art, title, artist, and year even if upstream search results change later.
- Alternatives considered: Re-querying MusicBrainz on every timeline render would be fragile; storing only an external album identifier would make the timeline dependent on an outside service for core display fields.

## 5. Timeline Pagination

- Decision: Use cursor-based pagination that initially returns 10 posts and fetches 10 more on scroll.
- Rationale: The feature explicitly needs incremental loading and cursor pagination keeps ordering stable for recently active group feeds.
- Alternatives considered: Offset pagination is easier to start with but becomes less stable when posts are added while the user scrolls.

## 6. Testing Strategy

- Decision: Use API integration tests for auth, timeline, search, and comment endpoints; use frontend component and flow tests for the feed, composer, comment disclosure, and profile views.
- Rationale: The constitution requires test coverage for every code change, and these tests map directly to user-visible behavior and boundary conditions.
- Alternatives considered: End-to-end-only coverage would miss contract regressions; unit-only coverage would not prove the full group feed and posting flows.
