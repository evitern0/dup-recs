# Implementation Plan: Group Management

**Branch**: `003-group-management` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-group-management/spec.md`

## Summary

Add a dedicated group-management landing view that lists all groups the signed-in user belongs to, preserves create-group and invite-token join flows, and routes login based on membership count: exactly one group goes directly to that group's timeline, while zero or multiple groups land on the management view.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+ for the API, React 18 for the web app

**Primary Dependencies**: Express, Passport, JWT, PostgreSQL client, React Router, React Testing Library, Vitest

**Storage**: PostgreSQL 18 via the existing API repository

**Testing**: `tsx --test` for API contract/integration tests and `vitest` for web feature tests

**Target Platform**: Web application running in modern desktop and mobile browsers

**Project Type**: Monorepo web application with React frontend and Express API backend

**Performance Goals**: Login routing and group selection should resolve within a single page transition and avoid extra full-page reloads

**Constraints**: Preserve membership-scoped access, keep existing create/join behaviors, and keep the group-management page reachable after login

**Scale/Scope**: Existing users, groups, memberships, invite flows, and timeline views; no new domain objects beyond group-management navigation support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I PASS: The feature strengthens the group-sharing loop by making group entry and switching easier.
- Principle II PASS: Any new membership summary or routing contract will need explicit, stable fields.
- Principle III PASS: Management and routing remain bounded to memberships the user already has.
- Principle IV PASS: The plan requires end-to-end validation across auth, group membership, and timeline navigation.
- Principle V PASS: The change stays localized to login routing, a management view, and supporting contract surfaces.
- Delivery Standards PASS: The work will require tests for the changed user paths and UI navigation.

## Project Structure

### Documentation (this feature)

```text
specs/003-group-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── src/
│   │   ├── auth/
│   │   ├── groups/
│   │   ├── lib/
│   │   └── users/
│   └── tests/
└── web/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── styles/
    └── tests/

packages/
└── shared/
```

**Structure Decision**: Keep the existing monorepo layout and implement the feature by extending `apps/web` for the new management view and routing, while adding the minimal API support needed to report a user's group memberships cleanly.

## Phase 0 Research Plan

1. Confirm the smallest API surface needed to drive login routing and the new group-management page.
2. Confirm the frontend route and component split that lets the management view stay reachable without duplicating timeline logic.
3. Confirm contract shapes for membership summaries and login-state routing so tests can assert the new behavior.

## Phase 1 Design Plan

1. Produce `data-model.md` for the membership-summary and routing-related entities/fields.
2. Produce `contracts/http-api.md` for the group-summary and login-routing contract changes.
3. Produce `contracts/ui-behavior.md` for the new landing-page and navigation behavior.
4. Produce `quickstart.md` for validating login routing, membership listing, and timeline navigation.

Post-Phase 1 constitution re-check:

- Principle I PASS: The design keeps the group entry loop central.
- Principle II PASS: Any new response fields and route contracts are named explicitly.
- Principle III PASS: Every view and redirect remains bound to group membership.
- Principle IV PASS: Validation covers the login path, management page, and timeline handoff.
- Principle V PASS: The work remains a narrow slice across auth and web navigation.
- Delivery Standards PASS: The plan requires behavior coverage for both API and UI changes.

## Complexity Tracking

No constitution violations identified; complexity table not required.
