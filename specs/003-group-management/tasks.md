# Tasks: Group Management

**Input**: Design documents from `/specs/003-group-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because the feature spec and constitution require end-to-end validation of the changed user paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create feature test scaffolding for the new flow in apps/api/tests/contract/group-management.test.ts and apps/web/tests/feature/group-management.test.jsx
- [ ] T002 [P] Extract the shared create/join controls into apps/web/src/components/groups/GroupActions.jsx and update apps/web/src/pages/GroupTimelinePage.jsx to use it

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Add a membership summary payload shape to apps/api/tests/http.ts and the repository query for the signed-in user's groups in apps/api/src/lib/repository.ts
- [ ] T004 [P] Expose GET /api/groups/mine from apps/api/src/groups/routes.ts and register the route in apps/api/src/app.ts if needed
- [ ] T005 [P] Add authenticated app-shell routing support in apps/web/src/App.jsx, apps/web/src/hooks/useAuth.jsx, and apps/web/src/pages/AuthPage.jsx for the new management route

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Group Management Home (Priority: P1) 🎯 MVP

**Goal**: Signed-in users can open a group management page that lists the groups they belong to and keeps the create-group and invite-token join actions available.

**Independent Test**: Sign in as users with zero, one, or multiple groups and verify the management page renders the memberships list plus create/join actions.

### Tests for User Story 1

- [ ] T006 [P] [US1] Add API contract coverage for GET /api/groups/mine and create/join continuity in apps/api/tests/contract/group-management.test.ts
- [ ] T007 [P] [US1] Add web feature coverage for the management landing page and create/join actions in apps/web/tests/feature/group-management.test.jsx

### Implementation for User Story 1

- [ ] T008 [US1] Implement the current-user group list query and GET /api/groups/mine response in apps/api/src/lib/repository.ts and apps/api/src/groups/routes.ts
- [ ] T009 [US1] Build the group management page in apps/web/src/pages/GroupManagementPage.jsx to list memberships and reuse apps/web/src/components/groups/GroupActions.jsx
- [ ] T010 [US1] Add the signed-in management route and top-level navigation entry in apps/web/src/App.jsx and apps/web/src/pages/AuthPage.jsx so the page is reachable at any time

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Open Group Timeline (Priority: P2)

**Goal**: Users can click any group they already belong to and open that group's timeline.

**Independent Test**: Sign in as a user with at least one group, click a listed group name, and confirm the timeline opens for that group.

### Tests for User Story 2

- [ ] T011 [P] [US2] Add a web feature test for clicking a listed group name and opening its timeline in apps/web/tests/feature/group-management.test.jsx

### Implementation for User Story 2

- [ ] T012 [US2] Make the group list entries clickable in apps/web/src/pages/GroupManagementPage.jsx so each row updates the active group via apps/web/src/hooks/useAuth.jsx and navigates to /app

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Login Routing (Priority: P3)

**Goal**: After login, users with exactly one group go directly to that group's timeline, while users with zero or multiple groups land on the management page.

**Independent Test**: Sign in as users with zero, one, and multiple groups and confirm the post-login landing destination matches the membership count.

### Tests for User Story 3

- [ ] T013 [P] [US3] Add login landing coverage for zero-, one-, and multi-group users in apps/api/tests/contract/group-management.test.ts and apps/web/tests/feature/group-management.test.jsx

### Implementation for User Story 3

- [ ] T014 [US3] Implement membership-aware login landing in apps/web/src/pages/AuthPage.jsx and apps/web/src/hooks/useAuth.jsx by querying GET /api/groups/mine after authentication
- [ ] T015 [US3] Route exactly-one-group users directly to that group's timeline and all other users to the management page in apps/web/src/App.jsx and apps/web/src/pages/AuthPage.jsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T016 [P] Update specs/003-group-management/quickstart.md with the final manual verification steps for login routing and group selection
- [ ] T017 Run pnpm --filter @dup-recs/api test, pnpm --filter @dup-recs/api typecheck, and pnpm --filter @dup-recs/web test -- --run to validate the feature end to end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses the shared group-management page and active-group state, but remains independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses the membership summary endpoint and the same landing route helpers

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Shared infrastructure before story-specific UI wiring
- API support before the UI consumes it
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel because they touch different files
- T003, T004, and T005 can run in parallel once Setup is complete
- T006 and T007 can run in parallel for User Story 1
- T011 can run in parallel with T012 once User Story 2 work starts
- T013 can run in parallel with the User Story 3 implementation tasks

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Add API contract coverage for GET /api/groups/mine and create/join continuity in apps/api/tests/contract/group-management.test.ts"
Task: "Add web feature coverage for the management landing page and create/join actions in apps/web/tests/feature/group-management.test.jsx"

# Launch the main implementation tasks together once the shared API surface exists:
Task: "Implement the current-user group list query and GET /api/groups/mine response in apps/api/src/lib/repository.ts and apps/api/src/groups/routes.ts"
Task: "Build the group management page in apps/web/src/pages/GroupManagementPage.jsx to list memberships and reuse apps/web/src/components/groups/GroupActions.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> foundation ready
2. Add User Story 1 -> test independently -> deploy/demo (MVP)
3. Add User Story 2 -> test independently -> deploy/demo
4. Add User Story 3 -> test independently -> deploy/demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid vague tasks, same file conflicts, and cross-story dependencies that break independence
