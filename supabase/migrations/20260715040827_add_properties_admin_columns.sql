/*
# Properties table: add featured, admin_status, and review columns

## Purpose
Extend the properties table to support the HQ admin control center:
- Featured listings (promote/pin to homepage)
- Admin moderation status (approve/reject/hide listings)
- Admin review notes
- Featured until timestamp (time-limited promotions)

## Changes to existing tables

### properties (ALTER TABLE — additive only, no data loss)
New columns:
- featured (boolean, default false): admin can feature/pin a listing
- featured_until (timestamptz, nullable): when the feature expires
- admin_status (text, default 'pending'): 'pending' | 'approved' | 'rejected' | 'hidden'
  — separate from the availability status; controls admin moderation
- admin_note (text, nullable): admin's review feedback
- reviewed_by (uuid, nullable, FK auth.users): which admin reviewed
- reviewed_at (timestamptz, nullable)

## Security
- Existing RLS policies remain unchanged.
- Admin can UPDATE any property (to feature, approve, reject, hide).
  A new policy is added for admin/hq role to update all properties.
*/

-- Add new columns to properties (idempotent)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS featured_until timestamptz;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS admin_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Index for featured listings query
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_admin_status ON public.properties(admin_status);

-- Admin can update any property (feature, approve, reject, hide, delete)
DROP POLICY IF EXISTS "prop_admin_update" ON public.properties;
CREATE POLICY "prop_admin_update"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role))
  WITH CHECK (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- Admin can delete any property
DROP POLICY IF EXISTS "prop_admin_delete" ON public.properties;
CREATE POLICY "prop_admin_delete"
  ON public.properties FOR DELETE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));
