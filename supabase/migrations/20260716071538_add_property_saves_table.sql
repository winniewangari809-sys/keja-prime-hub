/*
# Create property_saves table

1. New Tables
- `property_saves`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `property_id` (uuid, not null, references properties)
  - `created_at` (timestamp)
2. Security
- Enable RLS on `property_saves`.
- Owner-scoped CRUD: each authenticated user can only access their own saved properties.
3. Indexes
- Index on `user_id` for fast lookups
- Unique constraint on (user_id, property_id) to prevent duplicate saves
*/

CREATE TABLE IF NOT EXISTS property_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saves" ON property_saves;
CREATE POLICY "select_own_saves" ON property_saves FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saves" ON property_saves;
CREATE POLICY "insert_own_saves" ON property_saves FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saves" ON property_saves;
CREATE POLICY "delete_own_saves" ON property_saves FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_property_saves_user_id ON property_saves(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_saves_user_property ON property_saves(user_id, property_id);
