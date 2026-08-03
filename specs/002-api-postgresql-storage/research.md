# Research: API PostgreSQL Storage Migration

## Decision 1: Use PostgreSQL 18 as the authoritative store for API domain data

Rationale:
- The feature requires durable data across API restarts.
- PostgreSQL provides transactional integrity for multi-record operations such as invite acceptance and post/comment creation with membership checks.
- The repository already includes SQL migrations under `apps/api/migrations`, so PostgreSQL aligns with existing project direction.

Alternatives considered:
- Continue using in-memory storage: rejected because it cannot satisfy durability requirements.
- Use file-based local storage: rejected because it is weak for relational constraints and concurrent access.

## Decision 2: Use UUIDv7 for all entity primary keys

Rationale:
- The feature explicitly requires UUIDv7 primary keys.
- UUIDv7 provides globally unique IDs with time-ordered properties that improve index locality compared with random UUID variants.
- Applying UUIDv7 uniformly to users, groups, memberships, invitations, posts, and comments simplifies cross-entity conventions.

Alternatives considered:
- Keep text counters (for example `user_000001`): rejected because they are not globally unique and are not suitable for distributed-safe ID generation.
- Use UUIDv4: rejected because the requirement specifies UUIDv7 and because v7 offers better temporal ordering behavior.

## Decision 3: Track every DDL change as ordered SQL migration files in `apps/api/migrations`

Rationale:
- The feature explicitly requires migration files for all DDL SQL.
- Immutable, ordered SQL files provide a clear audit trail and support reliable environment promotion.
- SQL files keep schema evolution explicit and reviewable, matching the constitution requirement for stable contracts.

Alternatives considered:
- Runtime schema auto-sync: rejected because it obscures DDL history and weakens reviewability.
- Manual ad hoc database edits: rejected because they are non-repeatable and hard to verify in CI.

## Decision 4: Keep HTTP contract behavior stable while introducing storage error semantics

Rationale:
- The feature scope is storage replacement, not endpoint redesign.
- Existing routes and payload shapes must remain compatible for the web app and tests.
- Database outages require explicit, recoverable failure responses without leaking sensitive details.

Alternatives considered:
- Introduce new API versions immediately: rejected because no functional contract expansion is required for this migration.
- Return raw database errors directly: rejected due to security and operability concerns.

## Decision 5: Use transaction boundaries for multi-step writes

Rationale:
- Requirements prohibit partially applied writes when one user action spans multiple records.
- Transactional writes preserve consistency for workflows such as group creation with owner membership and invite acceptance creating membership updates.

Alternatives considered:
- Non-transactional sequential writes: rejected because partial failures can corrupt user-visible state.

## Resolved Clarifications

- Persistent data store version: PostgreSQL 18.
- ID strategy: UUIDv7 for all primary keys.
- DDL governance: every schema change is represented by an ordered SQL migration file in `apps/api/migrations`.
- Contract stability stance: existing API semantics preserved; storage failures mapped to recoverable API errors.
