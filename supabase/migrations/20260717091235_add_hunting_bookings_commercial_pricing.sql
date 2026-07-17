/*
# Create house_hunting_requests, airbnb_bookings, commercial_requests, and pricing_config tables

1. New Tables
- `house_hunting_requests` — Buyer/tenant concierge requests for property matching
  - id, requester_id (FK auth.users), name, phone, email, area, budget_min, budget_max, property_type, move_in_date, amenities (jsonb), status, lead_score, assigned_to, meeting_point, created_at, updated_at
- `airbnb_bookings` — Airbnb booking requests
  - id, property_id (FK properties), requester_id (FK auth.users), check_in, check_out, guests, name, phone, email, total_price, status, created_at, updated_at
- `commercial_requests` — Commercial property search/site visit requests
  - id, requester_id (FK auth.users), type (site_visit/search), property_id, business_type, area, budget, parking_needed, ground_floor, name, phone, email, status, created_at, updated_at
- `pricing_config` — Editable pricing for all packages (managed by HQ)
  - id, key (unique), category, name, price, description, is_active, updated_by, updated_at
2. Security
- Enable RLS on all tables
- Owner-scoped SELECT/INSERT for requesters; admin/hq full access
- admin/hq full CRUD on pricing_config; others read-only
3. Indexes
- Index on requester_id, property_id, status for all request tables
- Index on key for pricing_config
*/

-- House Hunting Requests
CREATE TABLE IF NOT EXISTS house_hunting_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  area text,
  budget_min numeric,
  budget_max numeric,
  property_type text,
  move_in_date date,
  amenities jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','suggested','viewing_scheduled','viewing_completed','negotiation','closed','cancelled')),
  lead_score text DEFAULT 'warm' CHECK (lead_score IN ('hot','warm','cold')),
  assigned_to text DEFAULT 'hq',
  meeting_point text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE house_hunting_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hhr" ON house_hunting_requests;
CREATE POLICY "select_own_hhr" ON house_hunting_requests FOR SELECT
  TO authenticated USING (auth.uid() = requester_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin')));

DROP POLICY IF EXISTS "insert_own_hhr" ON house_hunting_requests;
CREATE POLICY "insert_own_hhr" ON house_hunting_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "update_hhr_admin" ON house_hunting_requests;
CREATE POLICY "update_hhr_admin" ON house_hunting_requests FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin'))) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_hhr_requester ON house_hunting_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_hhr_status ON house_hunting_requests(status);

-- Airbnb Bookings
CREATE TABLE IF NOT EXISTS airbnb_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer DEFAULT 1,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  total_price numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','checked_in','checked_out','closed','cancelled')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE airbnb_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookings" ON airbnb_bookings;
CREATE POLICY "select_own_bookings" ON airbnb_bookings FOR SELECT
  TO authenticated USING (auth.uid() = requester_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin')));

DROP POLICY IF EXISTS "insert_own_bookings" ON airbnb_bookings;
CREATE POLICY "insert_own_bookings" ON airbnb_bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "update_bookings_admin" ON airbnb_bookings;
CREATE POLICY "update_bookings_admin" ON airbnb_bookings FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin'))) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_bookings_requester ON airbnb_bookings(requester_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON airbnb_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON airbnb_bookings(status);

-- Commercial Requests
CREATE TABLE IF NOT EXISTS commercial_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'search' CHECK (type IN ('site_visit','search')),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  business_type text,
  area text,
  budget text,
  parking_needed boolean DEFAULT false,
  ground_floor boolean DEFAULT false,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','contacted','scheduled','completed','closed','cancelled')),
  assigned_to text DEFAULT 'hq',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commercial_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cr" ON commercial_requests;
CREATE POLICY "select_own_cr" ON commercial_requests FOR SELECT
  TO authenticated USING (auth.uid() = requester_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin')));

DROP POLICY IF EXISTS "insert_own_cr" ON commercial_requests;
CREATE POLICY "insert_own_cr" ON commercial_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "update_cr_admin" ON commercial_requests;
CREATE POLICY "update_cr_admin" ON commercial_requests FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin'))) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cr_requester ON commercial_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_cr_status ON commercial_requests(status);

-- Pricing Configuration (HQ-managed)
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_pricing" ON pricing_config;
CREATE POLICY "read_pricing" ON pricing_config FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "write_pricing_admin" ON pricing_config;
CREATE POLICY "write_pricing_admin" ON pricing_config FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('hq','admin')));

-- Seed default pricing
INSERT INTO pricing_config (key, category, name, price, description) VALUES
  ('concierge_basic', 'concierge', 'House Hunting Concierge', 1999, 'Standard concierge service fee'),
  ('concierge_premium', 'concierge', 'Premium Concierge', 4999, 'Premium full-service concierge'),
  ('package_basic', 'package', 'Basic Listing', 0, 'Free listing with standard visibility'),
  ('package_verified', 'package', 'Verified Property', 1500, 'Verified badge + priority search'),
  ('package_featured', 'package', 'Featured Property', 3000, 'Homepage placement + higher ranking'),
  ('package_premium', 'package', 'Premium Property', 5000, 'Maximum visibility + VIP support'),
  ('verification_basic', 'verification', 'Basic Listing', 0, 'Standard listing'),
  ('verification_verified', 'verification', 'Verified Property', 1500, 'ID & ownership verified'),
  ('verification_featured', 'verification', 'Featured Property', 3000, 'Featured badge + homepage'),
  ('verification_premium', 'verification', 'Premium Property', 5000, 'Premium badge + top placement'),
  ('airbnb_listing', 'airbnb', 'Airbnb Listing Fee', 500, 'Per listing'),
  ('commercial_listing', 'commercial', 'Commercial Listing Fee', 2000, 'Per listing')
ON CONFLICT (key) DO NOTHING;
