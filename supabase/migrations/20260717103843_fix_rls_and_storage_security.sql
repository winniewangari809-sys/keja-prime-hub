/*
# Fix RLS Policy Bypasses and Storage Listing Exposure

## Summary

This migration fixes 5 security vulnerabilities:

1. **airbnb_bookings UPDATE policy bypass** — `update_bookings_admin` had `WITH CHECK (true)`, allowing unrestricted row modifications. Now requires admin/hq role in WITH CHECK.
2. **commercial_requests UPDATE policy bypass** — `update_cr_admin` had `WITH CHECK (true)`. Same fix applied.
3. **house_hunting_requests UPDATE policy bypass** — `update_hhr_admin` had `WITH CHECK (true)`. Same fix applied.
4. **failed_logins INSERT policy bypass** — `failed_logins_insert_all` allowed anon+authenticated with `WITH CHECK (true)`. Restricted to authenticated only.
5. **property-media bucket listing exposure** — Broad SELECT policy on `storage.objects` allowed listing all files. Removed since public bucket URLs work without it.

## Tables Modified

- `public.airbnb_bookings` — UPDATE policy WITH CHECK tightened to admin/hq check
- `public.commercial_requests` — UPDATE policy WITH CHECK tightened to admin/hq check
- `public.house_hunting_requests` — UPDATE policy WITH CHECK tightened to admin/hq check
- `public.failed_logins` — INSERT policy restricted from `anon, authenticated` to `authenticated` only
- `storage.objects` — Removed `Property media public read` SELECT policy

## Security Changes

### UPDATE policies (airbnb_bookings, commercial_requests, house_hunting_requests)

The USING clause correctly restricted updates to admin/hq users, but WITH CHECK (true) meant any modified row data was accepted without re-verification. Now WITH CHECK enforces the same admin/hq role requirement, ensuring only authorized users can make updates and the updated row still satisfies the authorization predicate.

### failed_logins INSERT policy

Previously allowed `anon` role to insert failed login records. Now restricted to `authenticated` only, since failed login tracking is an internal auth function, not a client-facing operation.

### property-media storage SELECT policy

The `Property media public read` policy allowed any client to list/enumerate all objects in the `property-media` bucket via Supabase Storage API. Since the bucket is `public = true`, individual object URLs are served directly without requiring a SELECT policy. Removing the broad listing policy prevents file enumeration while preserving public URL access.

## Important Notes

1. The HIBP leaked password protection (issue 6) is a GoTrue server configuration not exposed via SQL in this Supabase version. It must be enabled via the Supabase Dashboard (Authentication > Settings) or Management API.
2. The UPDATE policy fixes ensure row data is re-validated after update, closing the bypass where USING passes but WITH CHECK doesn't enforce.
3. The property-media bucket remains accessible via direct URLs — only the listing/enumeration capability is removed.
*/

-- 1. Fix airbnb_bookings UPDATE policy — WITH CHECK must enforce admin/hq role
DROP POLICY IF EXISTS "update_bookings_admin" ON public.airbnb_bookings;
CREATE POLICY "update_bookings_admin" ON public.airbnb_bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['hq'::app_role, 'admin'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['hq'::app_role, 'admin'::app_role])
    )
  );

-- 2. Fix commercial_requests UPDATE policy
DROP POLICY IF EXISTS "update_cr_admin" ON public.commercial_requests;
CREATE POLICY "update_cr_admin" ON public.commercial_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['hq'::app_role, 'admin'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['hq'::app_role, 'admin'::app_role])
    )
  );

-- 3. Fix house_hunting_requests UPDATE policy
DROP POLICY IF EXISTS "update_hhr_admin" ON public.house_hunting_requests;
CREATE POLICY "update_hhr_admin" ON public.house_hunting_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['hq'::app_role, 'admin'::app_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['hq'::app_role, 'admin'::app_role])
    )
  );

-- 4. Fix failed_logins INSERT policy — restrict to authenticated only
DROP POLICY IF EXISTS "failed_logins_insert_all" ON public.failed_logins;
CREATE POLICY "failed_logins_insert_all" ON public.failed_logins
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 5. Remove broad SELECT policy on property-media storage bucket
-- Public bucket URLs work without a SELECT policy; this only enabled file listing
DROP POLICY IF EXISTS "Property media public read" ON storage.objects;
