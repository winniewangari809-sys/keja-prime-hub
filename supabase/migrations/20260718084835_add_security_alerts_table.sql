/*
# Security Alerts Table for HQ Command Center

1. New Tables
- `security_alerts` — security events surfaced to HQ Command Center
  - `id` uuid PK
  - `user_id` uuid nullable (references auth.users, SET NULL on delete)
  - `alert_type` text (failed_login, multiple_failed_logins, suspicious_activity, suspicious_listing, account_abuse)
  - `email` text nullable
  - `ip_address` text nullable
  - `details` jsonb nullable
  - `severity` text (low, medium, high), default medium
  - `created_at` timestamptz default now()
2. Security
- RLS enabled.
- SELECT restricted to hq/admin roles via security.has_role().
- INSERT allowed for self (user_id = auth.uid()) or hq/admin role, so the auth flow and privileged monitors can write alerts.
3. Notes
- Uses existing security.has_role(_user_id, _role) helper.
- Idempotent: uses IF NOT EXISTS and DROP POLICY IF EXISTS.
*/

CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('failed_login','multiple_failed_logins','suspicious_activity','suspicious_listing','account_abuse')),
  email text,
  ip_address text,
  details jsonb,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_alerts_select_hq" ON public.security_alerts;
CREATE POLICY "security_alerts_select_hq" ON public.security_alerts
  FOR SELECT TO authenticated
  USING (security.has_role(auth.uid(), 'hq'::app_role) OR security.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "security_alerts_insert_self_or_hq" ON public.security_alerts;
CREATE POLICY "security_alerts_insert_self_or_hq" ON public.security_alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    OR security.has_role(auth.uid(), 'hq'::app_role)
    OR security.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_alert_type ON public.security_alerts(alert_type);
