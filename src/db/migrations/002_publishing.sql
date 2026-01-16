ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS publish_mode TEXT DEFAULT 'export_only' CHECK (publish_mode IN ('in_app_schedule','auto_publish','export_only')),
  ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft','approved','scheduled','published','failed')),
  ADD COLUMN IF NOT EXISTS publish_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_publish_error JSONB;

CREATE TABLE IF NOT EXISTS publishing_activity (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  content_item_id TEXT REFERENCES content_items(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
