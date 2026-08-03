# Data Model: Group Management

## Design Goals

- Support a dedicated management view that can list every group the current user belongs to.
- Preserve existing group timeline behavior and membership-scoped access.
- Make login routing depend on current membership count rather than cached assumptions.

## Entity Views

### User Session

Fields:
- `token` (JWT, required)
- `user` (authenticated user summary, required)
- `currentGroupId` (nullable string, derived from routing state)
- `membershipCount` (number, derived for routing)

Validation rules:
- `membershipCount` must reflect the memberships returned for the authenticated user at login time or on authenticated entry.
- `currentGroupId` must be set only when exactly one group is selected for direct timeline routing.

### Group Membership Summary

Fields:
- `groupId` (string, required)
- `groupName` (string, required)
- `createdAt` or display ordering metadata if needed by the UI

Validation rules:
- Every returned group must belong to the authenticated user.
- Group names must be suitable for display and selection in the management view.
- The list must be complete for the current user; partial membership lists are not sufficient for routing.

### Group Timeline Target

Fields:
- `groupId` (string, required)
- `groupName` (string, required for display)

Validation rules:
- Timeline navigation must continue to use a valid group identifier that the authenticated user can access.
- Clicking a group in the management view must navigate to the matching group timeline target.

## Relationships

- A user session resolves to zero, one, or many group memberships.
- Exactly one membership routes directly to a timeline target.
- Zero or many memberships route to the group-management view.

## State Transitions

- Login or authenticated entry -> membership summary lookup.
- Zero memberships -> management view.
- One membership -> timeline view for that group.
- Multiple memberships -> management view.
- Selecting a group in management -> selected timeline target.

## Contract Notes

- Membership enumeration is a navigation input, not a persisted new domain object.
- The feature should reuse existing group, membership, and timeline entities rather than introducing new storage tables.
