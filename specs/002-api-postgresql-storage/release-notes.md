# Release Notes: API PostgreSQL Storage Migration

## Summary

The API persistence layer now uses PostgreSQL-backed storage semantics, UUIDv7 entity IDs, ordered SQL migrations, and structured diagnostics for group, timeline, and comment failure paths.

## Delivered

- Added PostgreSQL/UUID dependencies and API environment sample.
- Added migration files:
  - `apps/api/migrations/002_uuidv7_base.sql`
  - `apps/api/migrations/003_indexes.sql`
- Replaced in-memory database implementation with SQL-backed adapter and repository.
- Added migration runner and transaction helpers.
- Added startup fail-fast behavior for missing `DATABASE_URL` and connectivity diagnostics.
- Added structured request correlation and failure event logging.
- Updated API routes/services/passport flows to asynchronous persistence operations.
- Expanded contract and integration tests for:
  - durable behavior across API restart
  - membership boundary behavior
  - startup failure validation
  - runtime interruption safe failures and diagnostics

## Validation Results

- API test suite command: `pnpm --filter @dup-recs/api test`
- Result: PASS
- Snapshot:
  - tests: 9
  - pass: 9
  - fail: 0

## Operational Notes

- Use PostgreSQL 18 for runtime environments.
- Apply migration files in lexical order, starting from `002_uuidv7_base.sql`.
- Use `x-request-id` and structured `*_failed` events for incident triage.
