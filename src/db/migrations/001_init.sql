CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ig_handle TEXT NOT NULL,
  ig_connected BOOLEAN NOT NULL DEFAULT FALSE,
  website_url TEXT,
  state TEXT NOT NULL DEFAULT 'created',
  plan_month TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free','pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image','video','logo')),
  source TEXT NOT NULL CHECK (source IN ('instagram','manual','website','upload','generated')),
  url TEXT NOT NULL,
  label TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_project_type ON assets(project_id, type);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  canonical_url TEXT,
  confidence NUMERIC,
  evidence JSONB,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  training_status TEXT NOT NULL DEFAULT 'none' CHECK (training_status IN ('none','queued','trained','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_project_confirmed ON products(project_id, confirmed);

CREATE TABLE IF NOT EXISTS brand_profiles (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'hr',
  profile JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_packs (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  goals JSONB NOT NULL,
  frequency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  content_pack_id TEXT REFERENCES content_packs(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('reel','carousel','story','feed')),
  topic TEXT NOT NULL,
  visual_source TEXT NOT NULL DEFAULT 'generated' CHECK (visual_source IN ('generated','custom_asset')),
  custom_asset_id TEXT REFERENCES assets(id),
  visual_brief JSONB NOT NULL,
  caption JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_pack_day ON content_items(content_pack_id, day);

CREATE TABLE IF NOT EXISTS renders (
  id TEXT PRIMARY KEY,
  content_item_id TEXT REFERENCES content_items(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('image','carousel_images','motion_video')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed')),
  outputs JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed','canceled')),
  progress NUMERIC,
  input JSONB,
  result JSONB,
  error JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
