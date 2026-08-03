---

description: "Task list for API PostgreSQL storage migration"
---

# Tasks: API PostgreSQL Storage Migration

**Input**: Design documents from `/specs/002-api-postgresql-storage/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because the specification success criteria and constitution require regression validation of core user flows and storage failure behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- API backend code: `apps/api/src/`
- API tests: `apps/api/tests/contract/` and `apps/api/tests/integration/`
- API schema migrations: `apps/api/migrations/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add PostgreSQL runtime dependencies and local setup surfaces required for migration work.

- [X] T001 Add PostgreSQL and UUIDv7 dependencies in apps/api/package.json
- [X] T002 Document PostgreSQL 18 and DATABASE_URL local setup in README.md
- [X] T003 [P] Add API database environment variable examples in apps/api/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish durable storage primitives and migration governance before user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add UUIDv7-friendly base schema migration for all core entities in apps/api/migrations/002_uuidv7_base.sql
- [X] T005 Add relational and timeline-performance indexes in apps/api/migrations/003_indexes.sql
- [X] T006 [P] Add migration runner utility for ordered SQL execution in apps/api/src/lib/migrations.ts
- [X] T007 [P] Replace in-memory database bootstrap with PostgreSQL pool/bootstrap module in apps/api/src/lib/db.ts
- [X] T008 [P] Add shared query helpers and transaction wrapper utilities in apps/api/src/lib/sql.ts
- [X] T009 Define database-backed repository interface for users/groups/posts/comments/invites in apps/api/src/lib/repository.ts
- [X] T010 Wire API startup to initialize PostgreSQL connection and fail fast on startup connection errors in apps/api/src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Keep Data Between Restarts (Priority: P1) 🎯 MVP

**Goal**: Persist all core records durably in PostgreSQL 18 so data remains available after API restart.

**Independent Test**: Create users/groups/posts/comments/invites, restart API, then confirm timeline/member-history/invite acceptance still return the same records.

### Tests for User Story 1

- [X] T011 [P] [US1] Add contract coverage for durable write-read behavior in apps/api/tests/contract/auth-groups.test.ts
- [X] T012 [P] [US1] Add integration restart-durability scenario in apps/api/tests/integration/timeline-posting.test.ts

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement PostgreSQL user persistence operations with UUIDv7 IDs in apps/api/src/users/service.ts
- [X] T014 [P] [US1] Implement PostgreSQL group and membership persistence operations in apps/api/src/groups/members.ts
- [X] T015 [P] [US1] Implement PostgreSQL invite persistence and acceptance operations in apps/api/src/groups/invites.ts
- [X] T016 [P] [US1] Implement PostgreSQL post persistence and timeline pagination queries in apps/api/src/posts/service.ts
- [X] T017 [P] [US1] Implement PostgreSQL comment persistence and ordered retrieval queries in apps/api/src/comments/service.ts
- [X] T018 [US1] Update auth route handlers to use PostgreSQL-backed user flows in apps/api/src/auth/routes.ts
- [X] T019 [US1] Update group route handlers to use PostgreSQL-backed membership/invite flows in apps/api/src/groups/routes.ts
- [X] T020 [US1] Update post route handlers to use PostgreSQL-backed timeline/post flows in apps/api/src/posts/routes.ts
- [X] T021 [US1] Update comment route handlers to use PostgreSQL-backed comment flows in apps/api/src/comments/routes.ts
- [X] T022 [US1] Update user profile route handlers to use PostgreSQL-backed member-history queries in apps/api/src/users/routes.ts

**Checkpoint**: User Story 1 is independently functional with persistent data across API restarts.

---

## Phase 4: User Story 2 - Preserve Existing Product Behavior (Priority: P2)

**Goal**: Maintain existing endpoint semantics, membership authorization, and validation behavior after persistence migration.

**Independent Test**: Execute existing user journeys and verify responses, authorization outcomes, and validation limits match prior behavior.

### Tests for User Story 2

- [X] T023 [P] [US2] Add contract assertions for unchanged endpoint payload semantics in apps/api/tests/contract/invites-comments.test.ts
- [X] T024 [P] [US2] Add contract assertions for membership boundary behavior in apps/api/tests/contract/member-history.test.ts
- [X] T025 [P] [US2] Add integration regression for register-group-post-comment flow in apps/api/tests/integration/invites-comments.test.ts
- [X] T026 [P] [US2] Add integration regression for member history ordering and visibility in apps/api/tests/integration/member-history.test.ts

### Implementation for User Story 2

- [X] T027 [US2] Preserve text-length validation and normalized input behavior in PostgreSQL-backed services in apps/api/src/posts/service.ts
- [X] T028 [US2] Preserve text-length validation and normalized input behavior in PostgreSQL-backed services in apps/api/src/comments/service.ts
- [X] T029 [US2] Preserve membership authorization checks for group-scoped reads/writes in apps/api/src/lib/authorization.ts
- [X] T030 [US2] Align Passport auth lookups and credential verification with PostgreSQL-backed users in apps/api/src/auth/passport.ts

**Checkpoint**: Existing API behavior remains stable while backed by PostgreSQL.

---

## Phase 5: User Story 3 - Recover Service State After Interruptions (Priority: P3)

**Goal**: Ensure the API handles startup/runtime database interruptions safely and resumes service from persisted state.

**Independent Test**: Simulate DB unavailability at startup and runtime, verify explicit safe failures, restore DB, and confirm successful resumed operations.

### Tests for User Story 3

- [X] T031 [P] [US3] Add integration startup failure scenario for unavailable database in apps/api/tests/integration/timeline-posting.test.ts
- [X] T032 [P] [US3] Add integration runtime interruption scenario with safe error responses in apps/api/tests/integration/invites-comments.test.ts

### Implementation for User Story 3

- [X] T033 [US3] Add startup readiness and fail-fast handling for missing/invalid DB config in apps/api/src/index.ts
- [X] T034 [US3] Add request-level storage error mapping without sensitive leak in apps/api/src/app.ts
- [X] T035 [US3] Add transaction boundaries for multi-step writes (group creation, invite acceptance) in apps/api/src/lib/repository.ts

**Checkpoint**: API recovers from interruptions using persisted data and safe failure handling.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize migration operability and verify release readiness.

- [X] T036 [P] Add migration rollback/forward-fix runbook notes in specs/002-api-postgresql-storage/quickstart.md
- [X] T037 [P] Add repository-level migration policy notes for tracked DDL SQL in README.md
- [X] T038 Run full API regression suite and record results in specs/002-api-postgresql-storage/release-notes.md
- [X] T039 [P] [US2] Add structured logging utility with request correlation support in apps/api/src/lib/logger.ts
- [X] T040 [US2] Instrument group, post, and comment read/write failure paths with structured events in apps/api/src/groups/routes.ts, apps/api/src/posts/routes.ts, and apps/api/src/comments/routes.ts
- [X] T041 [US3] Instrument startup and database connectivity failures with structured events in apps/api/src/index.ts and apps/api/src/lib/db.ts
- [X] T042 [P] [US3] Add integration assertions for safe failure responses and corresponding diagnostic event emission in apps/api/tests/integration/timeline-posting.test.ts and apps/api/tests/integration/invites-comments.test.ts
- [X] T043 [P] Add operator troubleshooting section mapping error classes to log fields in specs/002-api-postgresql-storage/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): No prerequisites.
- Phase 2 (Foundational): Depends on Phase 1 completion.
- Phase 3 (US1): Depends on Phase 2 completion.
- Phase 4 (US2): Depends on Phase 3 baseline persistence implementation.
- Phase 5 (US3): Depends on Phase 3 persistence and Phase 2 startup plumbing.
- Phase 6 (Polish): Depends on completion of targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after foundational work; establishes MVP persistence behavior.
- **US2 (P2)**: Depends on US1 data path migration being in place.
- **US3 (P3)**: Depends on US1 persistence implementation and foundational startup wiring.

### Within Each User Story

- Tests should be authored before or in parallel with implementation and must fail before final implementation adjustments.
- Repository/service persistence tasks precede route-level wiring tasks.
- Route wiring precedes full integration validation.

## Parallel Execution Examples

### US1

- Run T011 and T012 in parallel while persistence services are being implemented.
- Run T013, T014, T015, T016, and T017 in parallel, then integrate via T018-T022.

### US2

- Run T023, T024, T025, and T026 in parallel.
- Run T027, T028, T029, and T030 in parallel, then execute regression validation.

### US3

- Run T031 and T032 in parallel.
- Run T033 and T034 in parallel, then complete transaction hardening in T035.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Deliver US1 persistence end-to-end.
3. Validate durability through restart scenario (T012).

### Incremental Delivery

1. Add US2 compatibility and authorization regression safeguards.
2. Add US3 interruption recovery and error-handling hardening.
3. Finish with polish tasks and full API regression execution.

### Team Strategy

1. One engineer handles migrations/bootstrap (T004-T010).
2. One engineer handles persistence services/routes for US1 (T013-T022).
3. One engineer develops and stabilizes test suites for US2/US3 (T023-T032).
