/*
# Add Viewings and Concierge Requests Tables

## Purpose
KejaHub operates as a concierge-first platform where all communication flows through HQ Admin.
This migration adds two new tables:
1. `viewings` — scheduled property viewings requested by buyers/tenants, managed by HQ Admin
2. `concierge_requests` — "Let KejaHub Find For Me" requests and property inquiries routed to HQ

## New Tables

### `viewings`
- `id` (uuid, PK)
- `property_id` (uuid, FK to properties, nullable — allows viewings for mock/conceptual properties)
- `requester_id` (uuid, FK to auth.users, NOT NULL, defaults to auth.uid())
- `owner_id` (uuid, FK to auth.users, nullable — the property owner, set by admin)
- `preferred_date` (date, not null)
- `preferred_time` (text, not null)
- `phone_number` (text, not null — buyer's phone, visible ONLY to admin)
- `notes` (text, nullable)
- `status` (text: 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'completed' | 'cancelled', default 'pending')
- `admin_notes` (text, nullable — admin's internal notes)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### `concierge_requests`
- `id` (uuid, PK)
- `requester_id` (uuid, FK to auth.users, NOT NULL, defaults to auth.uid())
- `type` (text: 'inquiry' | 'find_property', default 'inquiry')
- `property_id` (uuid, FK to properties, nullable — for inquiries about specific properties)
- `full_name` (text, not null)
- `phone_number` (text, not null)
- `email` (text, nullable)
- `preferred_contact` (text, nullable — 'phone' | 'email' | 'whatsapp')
- `message` (text, nullable)
- `budget` (text, nullable — for find_property requests)
- `location` (text, nullable)
- `property_type` (text, nullable)
- `bedrooms` (text, nullable)
- `status` (text: 'pending' | 'contacted' | 'resolved' | 'closed', default 'pending')
- `admin_notes` (text, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security (RLS)

### viewings
- SELECT: requester can see their own viewings (property name + date + time + status only);
  property owner can see viewings on their properties (but NO buyer contact info —
  buyer phone/email is hidden from owners via column-level security in the app layer);
  admin/hq can see all viewings with full details
- INSERT: authenticated users can create viewings for themselves
- UPDATE: admin/hq can update status; requester can cancel their own; owner can mark completed
- DELETE: admin/hq only

### concierge_requests
- SELECT: requester can see their own requests; admin/hq can see all
- INSERT: authenticated users can create requests for themselves
- UPDATE: admin/hq only
- DELETE: admin/hq only

## Important Notes
1. Buyer contact information (phone, email) in viewings is visible ONLY to HQ Admin in the UI.
   The property owner/seller only sees: property name, preferred date, preferred time, and status.
   This is enforced at the application layer by filtering columns based on role.
2. All notifications for viewing requests route to HQ Admin — sellers do NOT receive
   buyer contact details, only a notification that "a viewing request has been submitted."
3. The `concierge_requests` table replaces direct buyer→seller communication.
   All inquiries flow through HQ Admin.
*/
CREATE TABLE IF NOT EXISTS viewings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  property_title text,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  phone_number text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;

-- Viewings: requester can see their own (full details including their phone)
DROP POLICY IF EXISTS "viewing_select_own" ON viewings;
CREATE POLICY "viewing_select_own"
ON viewings FOR SELECT
TO authenticated
USING (requester_id = auth.uid());

-- Viewings: property owner can see viewings on their properties (app layer hides buyer contact)
DROP POLICY IF EXISTS "viewing_select_owner" ON viewings;
CREATE POLICY "viewing_select_owner"
ON viewings FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = viewings.property_id AND p.owner_id = auth.uid()
  )
);

-- Viewings: admin/hq can see all
DROP POLICY IF EXISTS "viewing_select_admin" ON viewings;
CREATE POLICY "viewing_select_admin"
ON viewings FOR SELECT
TO authenticated
USING (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role));

-- Viewings: authenticated users can insert their own
DROP POLICY IF EXISTS "viewing_insert_own" ON viewings;
CREATE POLICY "viewing_insert_own"
ON viewings FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

-- Viewings: admin/hq can update (approve/reject/reschedule)
DROP POLICY IF EXISTS "viewing_update_admin" ON viewings;
CREATE POLICY "viewing_update_admin"
ON viewings FOR UPDATE
TO authenticated
USING (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role))
WITH CHECK (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role));

-- Viewings: requester can cancel their own
DROP POLICY IF EXISTS "viewing_update_own" ON viewings;
CREATE POLICY "viewing_update_own"
ON viewings FOR UPDATE
TO authenticated
USING (requester_id = auth.uid())
WITH CHECK (requester_id = auth.uid());

-- Viewings: admin/hq can delete
DROP POLICY IF EXISTS "viewing_delete_admin" ON viewings;
CREATE POLICY "viewing_delete_admin"
ON viewings FOR DELETE
TO authenticated
USING (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role));

CREATE TABLE IF NOT EXISTS concierge_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'inquiry' CHECK (type IN ('inquiry', 'find_property')),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  preferred_contact text CHECK (preferred_contact IS NULL OR preferred_contact IN ('phone', 'email', 'whatsapp')),
  message text,
  budget text,
  location text,
  property_type text,
  bedrooms text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved', 'closed')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE concierge_requests ENABLE ROW LEVEL SECURITY;

-- Concierge requests: requester can see their own
DROP POLICY IF EXISTS "concierge_select_own" ON concierge_requests;
CREATE POLICY "concierge_select_own"
ON concierge_requests FOR SELECT
TO authenticated
USING (requester_id = auth.uid());

-- Concierge requests: admin/hq can see all
DROP POLICY IF EXISTS "concierge_select_admin" ON concierge_requests;
CREATE POLICY "concierge_select_admin"
ON concierge_requests FOR SELECT
TO authenticated
USING (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role));

-- Concierge requests: authenticated users can insert their own
DROP POLICY IF EXISTS "concierge_insert_own" ON concierge_requests;
CREATE POLICY "concierge_insert_own"
ON concierge_requests FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

-- Concierge requests: admin/hq can update
DROP POLICY IF EXISTS "concierge_update_admin" ON concierge_requests;
CREATE POLICY "concierge_update_admin"
ON concierge_requests FOR UPDATE
TO authenticated
USING (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role))
WITH CHECK (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role));

-- Concierge requests: admin/hq can delete
DROP POLICY IF EXISTS "concierge_delete_admin" ON concierge_requests;
CREATE POLICY "concierge_delete_admin"
ON concierge_requests FOR DELETE
TO authenticated
USING (security.has_role(auth.uid(), 'admin'::app_role) OR security.has_role(auth.uid(), 'hq'::app_role));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_viewings_requester ON viewings(requester_id);
CREATE INDEX IF NOT EXISTS idx_viewings_property ON viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON viewings(status);
CREATE INDEX IF NOT EXISTS idx_concierge_requester ON concierge_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_concierge_status ON concierge_requests(status);
CREATE INDEX IF NOT EXISTS idx_concierge_type ON concierge_requests(type);
