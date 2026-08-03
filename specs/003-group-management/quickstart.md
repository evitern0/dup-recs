# Quickstart: Group Management

## Purpose

Validate that signed-in users land on the correct page after login and can move between group management and a specific group timeline.

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 18 available for the API
- The web app and API can be started locally

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start the API and web app using the repository's normal development commands.

## Validation Scenarios

### 1. Single-Group Login Routing

- Sign in as a user who belongs to exactly one group.

Expected result:
- The app opens that group's timeline directly.
- The top bar includes a Groups entry so the management page is still reachable.

### 2. Zero-Group Login Routing

- Sign in as a user who belongs to no groups.

Expected result:
- The app opens the group-management page.
- The page shows create-group and join-with-invite actions.
- Clicking a group name is not available until the user belongs to at least one group.

### 3. Multi-Group Login Routing

- Sign in as a user who belongs to multiple groups.

Expected result:
- The app opens the group-management page.
- The page lists each group the user belongs to.
- Selecting any listed group opens that group's timeline.

### 4. Group Timeline Navigation

- From the group-management page, click a group name.

Expected result:
- The app opens that group's timeline view.
- Use the Groups button in the header to return to group management at any time.

### 5. Reachability Check

- While signed in, navigate away from the current group timeline and return to group management.

Expected result:
- The group-management page is still reachable at any time.

## Test Commands

API contracts and integration flows:

```bash
pnpm --filter @dup-recs/api test
```

Web feature tests:

```bash
pnpm --filter @dup-recs/web test -- --run
```

Or run the provided workspace tasks when working in VS Code.
