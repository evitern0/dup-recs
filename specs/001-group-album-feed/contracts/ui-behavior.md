# UI Behavior Contract

## Authentication Gate

- The landing page requires login or registration.
- Unauthenticated users cannot access the group timeline, post composer, member list, or profile views.

## Timeline

- The group timeline is the post-login landing page for users who belong to a group.
- The timeline shows recent posts by all members of the same group in chronological order.
- The first load shows up to 10 posts.
- Additional posts load 10 at a time as the user scrolls.
- Creating a post refreshes the timeline so the new post is visible.

## New Recommendation Composer

- A dedicated New Rec button opens the post composer.
- The composer allows album lookup by album title or artist name.
- The composer requires a brief description and enforces a 255-character limit.
- Submitting a recommendation returns the user to the timeline with the new post present.

## Post Display

- Each post shows the posting user's username, album art, album title, artist, release year, and description.
- Comments are hidden by default.
- A user must expand a post to view or add comments.

## Group Membership Views

- The group page shows a list of other usernames in the group.
- Clicking another user's username opens that user's profile page.
- The profile page shows only that user's posts in chronological order.
- The profile page includes the comments associated with each post.

## Access Rules

- Non-members must not see another group's timeline, posts, comments, member list, or member profiles.
- Commenting and posting actions must be disabled outside the user's group memberships.
