<!-- Sync Impact Report
Version change: 1.1.0 -> 1.1.0
Modified principles: none
Added sections: Product Scope, Delivery Standards
Removed sections: none
Follow-up TODOs: none
-->
# dup-recs Constitution

## Core Principles

### I. Group-First Collaboration
The product MUST keep the group sharing loop as the primary experience: users create or
join a group, share an album to that group, and read or comment on albums shared by group
members. Any feature that does not strengthen that loop requires explicit justification.
This keeps the product focused and prevents feature drift into generic social networking.

### II. Explicit Domain Contracts
Group, membership, album share, comment, and invitation data MUST have explicit schemas
and stable field semantics. Changes to these contracts MUST be versioned or migrated in a
way that preserves existing user data and client expectations. Implicit shape changes are
not allowed because they create silent breakage across shared views and feeds.

### III. Membership-Scoped Access
Users MUST only see, create, or comment on content that belongs to groups they are a
member of, unless a feature explicitly defines a broader public surface. Authentication,
authorization, and UI states MUST enforce the same membership boundary so the client and
server cannot disagree about visibility.

### IV. Vertical-Slice Validation
Every meaningful change MUST be validated through the full user path it affects, not just
isolated helpers. For this app, that means testing flows such as group creation, joining a
group, sharing an album, loading the group feed, and adding a comment. Contract tests or
integration tests are required anywhere boundaries between storage, API, and UI can fail.

### V. Small, Reviewable Changes
Changes MUST be limited to the smallest coherent slice that solves the user-facing
problem. Large refactors, cross-cutting rewrites, and unrelated cleanup MUST be split so
the impact on group feeds, album sharing, and comments can be reviewed and tested in one
pass. This reduces regression risk in a product built around shared state.

## Product Scope

The product scope is intentionally narrow: group management, album sharing within a group,
commenting on shared albums, and the minimal supporting profile or invitation surfaces
needed to make those flows usable. New capabilities MUST be evaluated against that scope
before implementation. Features that do not improve discovery, sharing, discussion, or
group membership MUST be treated as out of scope unless the constitution is amended.

## Delivery Standards

Every code change MUST include test coverage that exercises the changed behavior or the
relevant contract boundary. Implementations MUST include tests that cover the affected
user path. UI changes MUST preserve readability on mobile and desktop. Any data
migration, authorization change, or feed-shaping change MUST include an explicit rollback
or recovery plan in the change description. Observability for failures in group loading,
album sharing, and comment submission MUST be sufficient to diagnose user-visible issues.

## Governance

This constitution supersedes informal project practices. Any amendment MUST update this
file, explain the user or engineering reason for the change, and include a version bump.
Patch bumps clarify existing rules without changing intent. Minor bumps add or expand a
principle or operational section. Major bumps redefine or remove a governing rule.
Compliance MUST be reviewed for every feature that touches group membership, album sharing,
comments, or persisted shared data. If a change conflicts with this constitution, the
constitution MUST be updated first or the change deferred.

**Version**: 1.1.0 | **Ratified**: 2026-08-02 | **Last Amended**: 2026-08-02
