# Quickstart: API PostgreSQL Storage Migration

## Purpose

Validate that API persistence has moved to PostgreSQL 18, preserves product behavior, and survives process restarts.

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 18 running and reachable from the API
- Environment variables configured for API startup, JWT, and database connectivity

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Apply schema migrations in order from `apps/api/migrations`:

```bash
for f in apps/api/migrations/*.sql; do
  echo "Applying $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```

3. Start API:

```bash
pnpm --filter @dup-recs/api dev
```

## Validation Scenarios

### 1. Startup with Persistent Store

- Start the API with valid PostgreSQL 18 configuration.
- Call health endpoint.

Expected result:
- API starts successfully and serves requests with persistent store configured.

### 2. Regression Flow: Register, Group, Post, Comment

- Register a user.
- Create or join a group.
- Create a recommendation post.
- Add a comment.

Expected result:
- API responses and behavior match existing contract expectations.

### 3. Restart Durability

- Complete scenario 2 and capture identifiers.
- Restart the API process.
- Re-query timeline, comments, and member history endpoints.

Expected result:
- Previously created records still exist and preserve expected ordering.

### 4. Membership Boundary Regression

- Attempt group-scoped reads/writes as a non-member.

Expected result:
- Unauthorized operations are denied exactly as before migration.

### 5. Storage Failure Behavior

- Simulate database unavailability.
- Exercise one read and one write endpoint.

Expected result:
- Affected requests fail with explicit recoverable errors.
- Responses do not leak sensitive connection or SQL details.

## Test Commands

Run API suites that validate contracts and user flows:

```bash
pnpm --filter @dup-recs/api test
```

Or run the workspace task for API tests if using the editor task runner:
- `run-api-tests`

## References

- Feature spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)
- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/http-api.md](./contracts/http-api.md)
