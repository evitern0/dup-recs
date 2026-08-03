# Implementation Plan: API PostgreSQL Storage Migration

**Branch**: `002-api-postgresql-storage` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-api-postgresql-storage/spec.md`

## Summary

Replace the API's in-memory persistence layer with PostgreSQL 18 as the durable system of record while preserving existing HTTP behavior and membership-scoped authorization. All primary keys across persisted entities will use UUIDv7, and all schema DDL changes will be tracked as ordered SQL migration files in `apps/api/migrations`.

## Technical Context

**Language/Version**: TypeScript (Node.js >=20)

**Primary Dependencies**: Express, Passport, JWT, bcryptjs, PostgreSQL client library for Node.js, shared validators/constants package

**Storage**: PostgreSQL 18 (persistent data store for all API domain entities)

**Testing**: Node test runner via `tsx --test`; contract and integration suites in `apps/api/tests`

**Target Platform**: Linux/macOS Node server environments (local dev and CI)

**Project Type**: Monorepo web application with API backend and React frontend

**Performance Goals**: Maintain current API responsiveness for group timeline, posts, comments, and membership checks under existing test load

**Constraints**: No user-facing API regressions; preserve authorization boundaries; enforce max text length constraints; durable data across API restarts

**Scale/Scope**: Existing feature scope (users, groups, memberships, invitations, posts, comments); migration from memory-backed behavior to persistent SQL-backed behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-Phase 0 gate assessment:

- Principle I (Group-First Collaboration): PASS. Persistence migration directly protects the core group sharing loop from data loss.
- Principle II (Explicit Domain Contracts): PASS with condition. Plan includes explicit data model and API contract continuity, plus SQL migration tracking for schema evolution.
- Principle III (Membership-Scoped Access): PASS. Existing membership checks remain mandatory and unchanged in API contract.
- Principle IV (Vertical-Slice Validation): PASS with requirement. Quickstart and tests include full flows across auth/group/timeline/comment boundaries.
- Principle V (Small, Reviewable Changes): PASS. Scope is constrained to storage replacement and migration safety.
- Delivery Standards: PASS with requirement. Plan includes regression coverage and rollback-minded migration discipline.
- Delivery Standards observability gate is satisfied only when explicit implementation and test tasks exist for group loading, album sharing, comment submission, and DB failure diagnostics.

## Project Structure

### Documentation (this feature)

```text
specs/002-api-postgresql-storage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── http-api.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── migrations/
│   │   └── 001_initial.sql
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── lib/
│   │   │   ├── authorization.ts
│   │   │   └── db.ts
│   │   ├── auth/
│   │   ├── groups/
│   │   ├── posts/
│   │   ├── comments/
│   │   └── users/
│   └── tests/
│       ├── contract/
│       └── integration/
└── web/
    └── src/

packages/
└── shared/
```

**Structure Decision**: Use existing monorepo web-app structure and confine implementation changes to `apps/api` plus migration files. No new top-level projects are introduced.

## Phase 0 Research Plan

Research tasks derived from technical context and user constraints:

1. Validate PostgreSQL 18 persistence strategy for current entities and relations.
2. Define UUIDv7 generation strategy for all primary keys.
3. Define migration file governance so every DDL change is tracked in ordered SQL files.
4. Define transaction and error-handling patterns to prevent partial writes and preserve API semantics.

## Phase 1 Design Plan

1. Produce `data-model.md` with UUIDv7 primary keys, constraints, indexes, and relationships.
2. Produce `contracts/http-api.md` documenting API compatibility requirements and failure semantics for storage-related errors.
3. Produce `quickstart.md` for validation scenarios covering migrations, restart durability, and regression behavior.

Post-Phase 1 constitution re-check:

- Principle I: PASS. Design preserves and strengthens group collaboration continuity.
- Principle II: PASS. Data model and contract artifacts explicitly describe stable semantics and migration expectations.
- Principle III: PASS. Membership-scoped access is retained as a contract invariant.
- Principle IV: PASS. Quickstart requires end-to-end validation and regression tests across API boundaries.
- Principle V: PASS. Changes remain storage-focused and avoid unrelated product redesign.
- Delivery Standards: PASS. Design requires test execution and migration traceability for recoverability.

## Complexity Tracking

No constitution violations identified; complexity table not required.
