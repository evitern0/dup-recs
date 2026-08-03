# Research: Group Management

## Decision 1: Add a dedicated membership summary endpoint for login routing and the management page

Rationale:
- The current login response returns only the authenticated user and token, which is not enough to decide whether to redirect to a single timeline or to a management view.
- The web app also needs the full list of memberships to render the new management view.
- A dedicated endpoint keeps login payloads stable while exposing the minimum extra data needed for the new navigation behavior.

Alternatives considered:
- Expand the login response with membership data: rejected because it couples authentication with a larger navigation payload and makes login behavior harder to keep stable.
- Reuse the timeline endpoint to infer membership count: rejected because timeline data is group-specific and does not describe all memberships.

## Decision 2: Keep the new group-management page in the web app as a standalone route

Rationale:
- The current app already uses React Router and routes the signed-in experience through a single authenticated entry point.
- A dedicated page makes the group list reachable at any time, which is a direct requirement.
- Separating management from timeline keeps the timeline focused on feed activity and reduces conditional UI complexity.

Alternatives considered:
- Fold management controls into the existing timeline page: rejected because it would blur the two distinct user tasks and make the default landing behavior harder to reason about.

## Decision 3: Route by membership count after login and on authenticated entry

Rationale:
- The feature requires different landing behavior for zero, one, or many groups.
- Routing should be based on current membership state rather than cached assumptions so the app reflects the user's most recent access.
- Keeping the decision at authenticated entry allows the user to reach management from anywhere while still optimizing the single-group case.

Alternatives considered:
- Always land on management: rejected because it adds extra steps for the common single-group case.
- Always land on the most recent group: rejected because it does not satisfy the explicit zero-group and multi-group requirements.

## Decision 4: Reuse the existing timeline and membership APIs for group-level navigation

Rationale:
- The current app already exposes timeline and member-list endpoints for a specific group.
- The new feature needs only a new view and a way to enumerate memberships; it does not require redefining timeline behavior.
- Reusing the existing group detail routes avoids widening the API surface beyond what the feature needs.

Alternatives considered:
- Introduce a second timeline model for management: rejected because the management page is not a new feed type.

## Resolved Clarifications

- Login routing should be based on the current count of memberships at the time the user authenticates.
- Users with exactly one group go directly to that group's timeline.
- Users with zero or multiple groups land on the new management view.
- The management page must remain reachable after authentication, not only immediately after login.
