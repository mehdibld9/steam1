-- =============================================================
--  مكتبة التعريب — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

-- Mods table
CREATE TABLE IF NOT EXISTS mods (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  game_name        TEXT NOT NULL,
  description      TEXT,
  image_url        TEXT,
  extra_images     TEXT,           -- JSON-encoded string[]
  download_count   INTEGER NOT NULL DEFAULT 0,
  view_count       INTEGER NOT NULL DEFAULT 0,
  download1_label  TEXT,
  download1_url    TEXT,
  download2_label  TEXT,
  download2_url    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id          SERIAL PRIMARY KEY,
  title       TEXT,
  image_url   TEXT NOT NULL,
  link_url    TEXT NOT NULL,
  position    TEXT NOT NULL DEFAULT 'home',  -- 'home' | 'mod_detail'
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin settings table (stores hashed admin credentials + site settings)
CREATE TABLE IF NOT EXISTS admin_settings (
  id             SERIAL PRIMARY KEY,
  username       TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  contact_url    TEXT,                              -- shown as "تواصل معنا" link in header
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
--  Auto-update updated_at on row changes
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mods_updated_at
  BEFORE UPDATE ON mods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
--  Row Level Security (optional but recommended for Supabase)
--  These tables are only accessed server-side, so we disable
--  RLS and rely on the API server for auth instead.
-- =============================================================

ALTER TABLE mods           DISABLE ROW LEVEL SECURITY;
ALTER TABLE ads            DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
