/*
# KejaHub Foundation: Add tenant/landlord roles, notifications, requests, properties tables

## Purpose
Extend the role system to include Tenant and Landlord, and add the core
data tables for notifications, property listings, and requests.

## Changes

### 1. Enum: add 'tenant' and 'landlord' to app_role
The app_role enum now includes: buyer, tenant, seller, landlord, agent, hq, admin.
'hq' is kept as an alias for admin (both route to the HQ dashboard).

### 2. Profiles: add full_name column
Add `full_name text` column to profiles, populated from first_name + last_name.
The trigger is updated to set full_name as well.

### 3. Notifications table
Stores role-based notifications with unread tracking.
- id, user_id, role (which role this notification is for), title, body,
  kind (message/viewing/offer/alert/announcement/etc), read (boolean), created_at

### 4. Properties table
Stores property listings created by sellers, landlords, and agents.
- id, owner_id, title, description, location, price, negotiable,
  property_type, bedrooms, bathrooms, size, amenities (jsonb),
  images (jsonb array of URLs), video_url,
  status (available/pending/reserved/sold/rented),
  created_at, updated_at

### 5. Requests table
Stores viewing requests, inquiries, and contact requests.
- id, property_id (nullable), requester_id, owner_id (nullable),
  type (viewing/inquiry/contact), message, status (pending/approved/rejected),
  created_at

## Security
- RLS enabled on all new tables.
- Notifications: users see only their own notifications.
- Properties: public read (anyone can browse), owner-only write.
- Requests: users see requests they made or received; admin sees all.
- The handle_new_user trigger is updated to handle the new roles.
*/

-- 1. Add new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tenant' BEFORE 'seller';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'landlord' BEFORE 'agent';

-- 2. Add full_name column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

-- Update existing rows to populate full_name from first_name + last_name
UPDATE public.profiles
SET full_name = trim(coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
WHERE full_name IS NULL;

-- 3. Update handle_new_user to also set full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  _role public.app_role;
  _first text;
  _last text;
  _full text;
begin
  _first := coalesce(new.raw_user_meta_data->>'first_name', '');
  _last := coalesce(new.raw_user_meta_data->>'last_name', '');
  _full := trim(_first || ' ' || _last);

  insert into public.profiles (id, first_name, last_name, full_name, phone, email)
  values (new.id, _first, _last, _full, coalesce(new.raw_user_meta_data->>'phone', ''), new.email);

  _role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'buyer'::public.app_role);
  -- Prevent self-assignment of privileged roles via signup metadata
  if _role in ('hq', 'admin') then
    _role := 'buyer';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, _role);
  return new;
end;
$function$;

-- 4. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'alert',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_insert_own" ON public.notifications;
CREATE POLICY "notif_insert_own"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin can see all notifications
DROP POLICY IF EXISTS "notif_admin_all" ON public.notifications;
CREATE POLICY "notif_admin_all"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- 5. Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  price numeric,
  negotiable boolean NOT NULL DEFAULT false,
  property_type text NOT NULL DEFAULT 'rental',
  bedrooms int,
  bathrooms int,
  size text,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

-- Anyone can browse properties (public read)
DROP POLICY IF EXISTS "prop_select_all" ON public.properties;
CREATE POLICY "prop_select_all"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only the owner can insert/update/delete their properties
DROP POLICY IF EXISTS "prop_insert_own" ON public.properties;
CREATE POLICY "prop_insert_own"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "prop_update_own" ON public.properties;
CREATE POLICY "prop_update_own"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "prop_delete_own" ON public.properties;
CREATE POLICY "prop_delete_own"
  ON public.properties FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- updated_at trigger for properties
CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. Requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'inquiry',
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;

-- Users can see requests they made or received
DROP POLICY IF EXISTS "req_select_own" ON public.requests;
CREATE POLICY "req_select_own"
  ON public.requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "req_insert_own" ON public.requests;
CREATE POLICY "req_insert_own"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "req_update_own" ON public.requests;
CREATE POLICY "req_update_own"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid() OR owner_id = auth.uid())
  WITH CHECK (requester_id = auth.uid() OR owner_id = auth.uid());

-- Admin can see all requests
DROP POLICY IF EXISTS "req_admin_all" ON public.requests;
CREATE POLICY "req_admin_all"
  ON public.requests FOR SELECT
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));
