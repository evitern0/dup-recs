# UI Behavior Contract

## Authentication Entry

- Signed-in users must be routed according to membership count after login.
- Users with exactly one group go directly to that group's timeline.
- Users with zero or multiple groups land on the group-management page.

## Group Management View

- The view lists every group the signed-in user belongs to.
- Each group name is clickable and opens that group's timeline.
- The existing create-group form remains available.
- The existing invite-token join flow remains available.
- The page is reachable at any time while the user is signed in.

## Timeline View

- The timeline remains the primary group activity view.
- Timeline navigation from the management page must preserve group-scoped access rules.
- The timeline should continue to support the existing member list and invite flow.

## Access Rules

- Unauthenticated users cannot access the management view or timeline views.
- Non-members must not see groups they do not belong to in the management view.
- Clicking a listed group must never bypass membership checks.
