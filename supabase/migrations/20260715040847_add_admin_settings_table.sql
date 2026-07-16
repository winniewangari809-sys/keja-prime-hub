/*
# Admin settings table — system-wide emergency controls and configuration

## Purpose
Store platform-wide settings that the HQ admin can toggle from the Emergency
Control center: maintenance mode, messaging enabled, listings enabled, etc.
Also stores failed login tracking and platform text/branding overrides.

## New Tables

### 1. admin_settings
A key-value store for platform settings. Each row is one setting.
- id (uuid, primary key)
- key (text, unique): e.g. 'maintenance_mode', 'messaging_enabled',
  'listings_enabled', 'site_name', 'site_logo_url', 'primary_color'
- value (text): the setting value (string, boolean as 'true'/'false', etc.)
- updated_by (uuid, nullable, FK auth.users)
- updated_at (timestamptz, default now())
- created_at (timestamptz, default now())

### 2. failed_logins
Tracks failed login attempts for the security/monitoring dashboard.
- id (uuid, primary key)
- email (text, nullable): attempted email
- ip_address (text, nullable)
- occurred_at (timestamptz, default now())

## Security
- RLS enabled on both tables.
- admin_settings: public read (so the site can check maintenance mode),
  admin-only write.
- failed_logins: admin-only read, anyone can insert (login attempts).
*/

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.admin_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;

-- Public read: the site needs to check maintenance_mode etc.
DROP POLICY IF EXISTS "settings_select_all" ON public.admin_settings;
CREATE POLICY "settings_select_all"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only write
DROP POLICY IF EXISTS "settings_admin_write" ON public.admin_settings;
CREATE POLICY "settings_admin_write"
  ON public.admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

DROP POLICY IF EXISTS "settings_admin_update" ON public.admin_settings;
CREATE POLICY "settings_admin_update"
  ON public.admin_settings FOR UPDATE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role))
  WITH CHECK (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

DROP POLICY IF EXISTS "settings_admin_delete" ON public.admin_settings;
CREATE POLICY "settings_admin_delete"
  ON public.admin_settings FOR DELETE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- Seed default settings
INSERT INTO public.admin_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('messaging_enabled', 'true'),
  ('listings_enabled', 'true'),
  ('registrations_enabled', 'true'),
  ('site_name', 'KejaHub'),
  ('primary_color', '#0f4c5c')
ON CONFLICT (key) DO NOTHING;

-- Failed logins table
CREATE TABLE IF NOT EXISTS public.failed_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip_address text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.failed_logins ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.failed_logins TO anon, authenticated;
GRANT SELECT ON public.failed_logins TO authenticated;
GRANT ALL ON public.failed_logins TO service_role;

-- Anyone can insert (login attempts are anonymous)
DROP POLICY IF EXISTS "failed_logins_insert_all" ON public.failed_logins;
CREATE POLICY "failed_logins_insert_all"
  ON public.failed_logins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin-only read
DROP POLICY IF EXISTS "failed_logins_admin_read" ON public.failed_logins;
CREATE POLICY "failed_logins_admin_read"
  ON public.failed_logins FOR SELECT
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_failed_logins_occurred_at ON public.failed_logins(occurred_at DESC);
