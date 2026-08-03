BEGIN;

CREATE INDEX IF NOT EXISTS idx_posts_group_created_desc
  ON posts (group_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_created_asc
  ON comments (post_id, created_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_posts_user_created_asc
  ON posts (user_id, created_at ASC, id ASC);

COMMIT;
