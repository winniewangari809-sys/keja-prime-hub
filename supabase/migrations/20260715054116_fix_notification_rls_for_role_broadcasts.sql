/*
# Fix notification RLS policies for role-based notifications

## Purpose
The existing notification RLS policies only allow users to read/update
notifications where `user_id = auth.uid()`. But role-based notifications
(where `user_id` is null and `role` is set to e.g. 'buyer') are invisible
to users — they can't read or mark them as read.

Additionally, the INSERT policy requires `user_id = auth.uid()`, which
prevents the admin from inserting role-based notifications with
`user_id = null`.

## Changes

### 1. SELECT policy: allow reading own + role-matching notifications
Users can now read notifications where:
- `user_id = auth.uid()` (directly addressed), OR
- `role` matches their own role (role-based broadcast), OR
- admin/hq can read all

### 2. UPDATE policy: allow marking role-based notifications as read
Users can now update notifications where:
- `user_id = auth.uid()` (own notifications), OR
- `role` matches their role AND `user_id` is null (role broadcast)
This lets them mark role-based notifications as read.

### 3. INSERT policy: allow admin to insert role-based notifications
Admin/hq can insert notifications with any `user_id` (including null
for role-based broadcasts). Regular users can still only insert their
own.

## Security
- No new tables or columns.
- RLS remains enabled.
- Users can only read/update notifications addressed to them or their role.
- Admin retains full access.
*/

-- Drop old policies
DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_admin_all" ON public.notifications;

-- SELECT: users see their own + role-matching + admin sees all
CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND role = (
      SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = auth.uid() LIMIT 1
    ))
  );

-- Admin can read all notifications
CREATE POLICY "notif_admin_all"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- INSERT: users insert own, admin inserts any
CREATE POLICY "notif_insert_own"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif_insert_admin"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- UPDATE: users update own + role-based (user_id null) where role matches
CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND role = (
      SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = auth.uid() LIMIT 1
    ))
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (user_id IS NULL AND role = (
      SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = auth.uid() LIMIT 1
    ))
  );

-- Admin can update all notifications
CREATE POLICY "notif_update_admin"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role))
  WITH CHECK (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));
