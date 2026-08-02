# Tasks: Social Music Group Feed

**Input**: Design documents from `/specs/001-group-album-feed/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included because the constitution requires test coverage for every code change and the plan defines API and UI validation as part of the delivery strategy.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the monorepo structure and shared development scaffolding.

- [X] T001 Create the monorepo workspace and root package metadata in `/Users/npoq/Dev/dup-recs/package.json` and `/Users/npoq/Dev/dup-recs/pnpm-workspace.yaml`
- [X] T002 Create the backend application scaffold in `/Users/npoq/Dev/dup-recs/apps/api/package.json` and `/Users/npoq/Dev/dup-recs/apps/api/src/index.ts`
- [X] T003 Create the frontend application scaffold in `/Users/npoq/Dev/dup-recs/apps/web/package.json` and `/Users/npoq/Dev/dup-recs/apps/web/src/main.jsx`
- [X] T004 [P] Create the shared package scaffold and common contract folder in `/Users/npoq/Dev/dup-recs/packages/shared/package.json` and `/Users/npoq/Dev/dup-recs/packages/shared/src/index.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the core data model, auth foundation, routing, and shared validation needed by every user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Define PostgreSQL schema and migration files for users, groups, memberships, invitations, posts, and comments in `/Users/npoq/Dev/dup-recs/apps/api/migrations/`
- [X] T006 [P] Implement shared validation and type definitions for users, groups, posts, and comments in `/Users/npoq/Dev/dup-recs/packages/shared/src/types/` and `/Users/npoq/Dev/dup-recs/packages/shared/src/validators/`
- [X] T007 Implement Passport auth setup with OAuth strategies and JWT issuance in `/Users/npoq/Dev/dup-recs/apps/api/src/auth/`
- [X] T008 Set up Express app wiring, middleware, error handling, and route registration in `/Users/npoq/Dev/dup-recs/apps/api/src/app.ts`
- [X] T009 [P] Implement database access helpers and group membership authorization checks in `/Users/npoq/Dev/dup-recs/apps/api/src/lib/db.ts` and `/Users/npoq/Dev/dup-recs/apps/api/src/lib/authorization.ts`
- [X] T010 [P] Add shared API client and session bootstrap utilities for the frontend in `/Users/npoq/Dev/dup-recs/apps/web/src/services/api.js` and `/Users/npoq/Dev/dup-recs/apps/web/src/hooks/useAuth.jsx`
- [X] T011 Create API and frontend test harness configuration in `/Users/npoq/Dev/dup-recs/apps/api/tests/` and `/Users/npoq/Dev/dup-recs/apps/web/tests/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Register, join a group, and publish a recommendation (Priority: P1) 🎯 MVP

**Goal**: A user can register, sign in, create or join a group, and publish a new album recommendation into the group timeline.

**Independent Test**: Register a user, authenticate, create or join a group, search for an album by title or artist, submit a recommendation, and verify that the new post appears in the first timeline page.

### Tests for User Story 1

- [X] T012 [P] [US1] Add auth and group access contract tests for registration, login, group creation, and join flows in `/Users/npoq/Dev/dup-recs/apps/api/tests/contract/auth-groups.test.ts`
- [X] T013 [P] [US1] Add integration tests for timeline pagination, album search, and new recommendation flow in `/Users/npoq/Dev/dup-recs/apps/api/tests/integration/timeline-posting.test.ts`
- [X] T014 [P] [US1] Add frontend flow tests for landing page gating, group entry, and the New Rec composer in `/Users/npoq/Dev/dup-recs/apps/web/tests/feature/timeline-composer.test.jsx`

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement user registration and login endpoints in `/Users/npoq/Dev/dup-recs/apps/api/src/auth/routes.ts`
- [X] T016 [P] [US1] Implement group creation and join endpoints in `/Users/npoq/Dev/dup-recs/apps/api/src/groups/routes.ts`
- [X] T017 [US1] Implement album search integration using node-musicbrainz in `/Users/npoq/Dev/dup-recs/apps/api/src/albums/search.ts`
- [X] T018 [US1] Implement recommendation post creation, album snapshot persistence, and paginated timeline retrieval in `/Users/npoq/Dev/dup-recs/apps/api/src/posts/routes.ts`
- [X] T019 [US1] Build the authenticated landing page, group timeline, and New Rec composer with initial 10-post load and scroll-based loading in `/Users/npoq/Dev/dup-recs/apps/web/src/pages/GroupTimelinePage.jsx`
- [X] T020 [US1] Add timeline item and post composer components in `/Users/npoq/Dev/dup-recs/apps/web/src/components/timeline/`
- [X] T021 [US1] Add server-side validation and authorization for timeline visibility, post creation, album snapshot integrity, and 255-character limits in `/Users/npoq/Dev/dup-recs/apps/api/src/posts/service.ts`

**Checkpoint**: User Story 1 should now be fully functional and independently testable.

---

## Phase 4: User Story 2 - Invite members, list group users, and manage comments (Priority: P2)

**Goal**: A group member can invite others by email, view the usernames in their group, and add comments to posts with comments hidden by default.

**Independent Test**: Invite a user by email, open the group member list, expand comments on a post, add a comment, and confirm the comment is visible after expansion.

### Tests for User Story 2

- [X] T022 [P] [US2] Add contract tests for invitations, member listing, and comment creation in `/Users/npoq/Dev/dup-recs/apps/api/tests/contract/invites-comments.test.ts`
- [X] T023 [P] [US2] Add integration tests for invite creation, hidden comment disclosure, comment posting, and 255-character comment validation in `/Users/npoq/Dev/dup-recs/apps/api/tests/integration/invites-comments.test.ts`
- [X] T024 [P] [US2] Add frontend flow tests for member list, comment expansion, and comment submission in `/Users/npoq/Dev/dup-recs/apps/web/tests/feature/members-comments.test.jsx`

### Implementation for User Story 2

- [X] T025 [US2] Implement invite endpoints and email-based invite records in `/Users/npoq/Dev/dup-recs/apps/api/src/groups/invites.ts`
- [X] T026 [US2] Implement group member listing endpoints in `/Users/npoq/Dev/dup-recs/apps/api/src/groups/members.ts`
- [X] T027 [US2] Implement post comment endpoints, hidden-by-default comment retrieval, and 255-character comment validation in `/Users/npoq/Dev/dup-recs/apps/api/src/comments/routes.ts`
- [X] T028 [US2] Build the group member list and expandable comment UI in `/Users/npoq/Dev/dup-recs/apps/web/src/components/groups/`
- [X] T029 [US2] Wire comment loading and comment submission into the post card UI in `/Users/npoq/Dev/dup-recs/apps/web/src/components/posts/PostCard.jsx`
- [X] T030 [US2] Enforce group membership checks for invites, members, and comments in `/Users/npoq/Dev/dup-recs/apps/api/src/lib/authorization.ts`

**Checkpoint**: User Story 2 should now be fully functional and independently testable.

---

## Phase 5: User Story 3 - View a member profile and their post history (Priority: P3)

**Goal**: A user can click another group member's username and view that person's posts and comments in chronological order.

**Independent Test**: Select another member from the group list and confirm the profile page shows only that user's recommendations, ordered chronologically, with their comments.

### Tests for User Story 3

- [X] T031 [P] [US3] Add contract tests for member profile history responses in `/Users/npoq/Dev/dup-recs/apps/api/tests/contract/member-history.test.ts`
- [X] T032 [P] [US3] Add integration tests for user profile history ordering and group access control in `/Users/npoq/Dev/dup-recs/apps/api/tests/integration/member-history.test.ts`
- [X] T033 [P] [US3] Add frontend flow tests for username navigation and profile history rendering in `/Users/npoq/Dev/dup-recs/apps/web/tests/feature/member-history.test.jsx`

### Implementation for User Story 3

- [X] T034 [US3] Implement member history API endpoints in `/Users/npoq/Dev/dup-recs/apps/api/src/users/routes.ts`
- [X] T035 [US3] Implement chronological post and comment aggregation for a user's profile in `/Users/npoq/Dev/dup-recs/apps/api/src/users/service.ts`
- [X] T036 [US3] Build the profile page for member history in `/Users/npoq/Dev/dup-recs/apps/web/src/pages/MemberProfilePage.jsx`
- [X] T037 [US3] Add username navigation from the group member list to the profile page in `/Users/npoq/Dev/dup-recs/apps/web/src/components/groups/MemberList.jsx`
- [X] T038 [US3] Add profile-specific timeline presentation components in `/Users/npoq/Dev/dup-recs/apps/web/src/components/profile/`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T039 [P] Tighten UI responsiveness, spacing, and light-theme presentation across `/Users/npoq/Dev/dup-recs/apps/web/src/styles/`
- [X] T040 [P] Add accessibility and empty-state refinements for timelines, composer, comments, and profiles in `/Users/npoq/Dev/dup-recs/apps/web/src/components/`
- [X] T041 Verify pagination, search, and comment behavior against `/Users/npoq/Dev/dup-recs/specs/001-group-album-feed/quickstart.md`
- [X] T042 Run the full API and frontend test suites for `/Users/npoq/Dev/dup-recs/apps/api/tests/` and `/Users/npoq/Dev/dup-recs/apps/web/tests/`
- [X] T043 Update feature documentation and release notes in `/Users/npoq/Dev/dup-recs/specs/001-group-album-feed/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundation - no dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundation - may integrate with US1 but must remain independently testable.
- **User Story 3 (P3)**: Can start after Foundation - may integrate with US1/US2 but must remain independently testable.

### Within Each User Story

- Tests are written first and should fail before implementation.
- Shared models/validation before services.
- Services before route handlers or UI wiring.
- Core flow before integration and polish.

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel.
- Foundational tasks marked [P] can run in parallel once the scaffold exists.
- Tests for a given story marked [P] can run in parallel.
- Different stories can be worked on in parallel after Phase 2 is complete.

## Parallel Example: User Story 1

```bash
Task: "Add auth and group access contract tests for registration, login, group creation, and join flows in /Users/npoq/Dev/dup-recs/apps/api/tests/contract/auth-groups.test.ts"
Task: "Add integration tests for the timeline landing page, album search, and new recommendation flow in /Users/npoq/Dev/dup-recs/apps/api/tests/integration/timeline-posting.test.ts"
Task: "Add frontend flow tests for landing page gating, group entry, and the New Rec composer in /Users/npoq/Dev/dup-recs/apps/web/tests/feature/timeline-composer.test.jsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the registration, group entry, album search, and post timeline flow.

### Incremental Delivery

1. Setup + Foundation.
2. Deliver User Story 1 as the MVP.
3. Add User Story 2 without breaking the MVP.
4. Add User Story 3.
5. Finish with polish and cross-cutting cleanup.
