/*
# Property Media Table — categorized photos and videos with admin review

## Purpose
Store individual photo and video uploads for property listings, each with a
category label (Cover, Living Room, Kitchen, etc.), display order, and an
admin review status. This enables the Smart Photo/Video Upload System and
the HQ Media Control center.

## New Tables

### 1. property_media
Stores each uploaded photo or video for a property.
- id (uuid, primary key)
- property_id (uuid, FK to properties, cascade on delete)
- owner_id (uuid, FK to auth.users, cascade on delete) — the uploader
- kind (text): 'photo' | 'video'
- category (text): e.g. 'Cover', 'Living Room', 'Kitchen', 'Bedroom',
  'Bathroom', 'Toilet', 'Dining Area', 'Compound', 'Parking', 'Entrance',
  'Security Gate', 'Office Area', 'Shop Front', 'Airbnb Amenities',
  'Exterior', 'Pool', 'Balcony', 'Reception', 'Open Space', 'Floor Plan'
- storage_path (text): path in Supabase Storage bucket
- public_url (text): public/signed URL to display the media
- thumbnail_url (text, nullable): for videos, auto-generated poster image
- duration (text, nullable): for videos, e.g. "1:24"
- file_size (bigint, nullable): bytes
- mime_type (text, nullable)
- display_order (int, default 0): for drag-and-drop reordering; first photo
  with category 'Cover' (or lowest order) is the cover image
- is_cover (boolean, default false): explicitly marks the cover photo
- review_status (text): 'pending' | 'approved' | 'rejected' | 'needs_better'
  — admin moderation workflow
- review_note (text, nullable): admin feedback when requesting better photos
- reviewed_by (uuid, nullable, FK to auth.users): which admin reviewed
- reviewed_at (timestamptz, nullable)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### 2. storage bucket
A public storage bucket named `property-media` is created for uploaded
photos and videos. RLS on the bucket allows public read, authenticated
upload by the owner, and admin delete.

## Security
- RLS enabled on property_media.
- Public read: anyone (anon + authenticated) can SELECT — photos/videos are
  visible on public listing pages.
- Owner insert/update/delete: users can manage media for properties they own.
- Admin full access: admin/hq role can SELECT, UPDATE (review), and DELETE
  any media row.
- updated_at trigger for review_status changes.
*/

CREATE TABLE IF NOT EXISTS public.property_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'photo',
  category text NOT NULL DEFAULT 'Living Room',
  storage_path text NOT NULL,
  public_url text NOT NULL,
  thumbnail_url text,
  duration text,
  file_size bigint,
  mime_type text,
  display_order int NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  review_status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.property_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_media TO authenticated;
GRANT ALL ON public.property_media TO service_role;

-- Public read: anyone browsing can see property media
DROP POLICY IF EXISTS "media_select_all" ON public.property_media;
CREATE POLICY "media_select_all"
  ON public.property_media FOR SELECT
  TO anon, authenticated
  USING (true);

-- Owner can insert media for their own properties
DROP POLICY IF EXISTS "media_insert_own" ON public.property_media;
CREATE POLICY "media_insert_own"
  ON public.property_media FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Owner can update their own media (reorder, change category, cover)
DROP POLICY IF EXISTS "media_update_own" ON public.property_media;
CREATE POLICY "media_update_own"
  ON public.property_media FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Owner can delete their own media
DROP POLICY IF EXISTS "media_delete_own" ON public.property_media;
CREATE POLICY "media_delete_own"
  ON public.property_media FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Admin can update any media (review workflow: approve/reject/request better)
DROP POLICY IF EXISTS "media_admin_update" ON public.property_media;
CREATE POLICY "media_admin_update"
  ON public.property_media FOR UPDATE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role))
  WITH CHECK (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- Admin can delete any media (remove inappropriate content)
DROP POLICY IF EXISTS "media_admin_delete" ON public.property_media;
CREATE POLICY "media_admin_delete"
  ON public.property_media FOR DELETE
  TO authenticated
  USING (security.has_role(auth.uid(), 'admin'::public.app_role) OR security.has_role(auth.uid(), 'hq'::public.app_role));

-- updated_at trigger
CREATE TRIGGER property_media_set_updated_at
  BEFORE UPDATE ON public.property_media
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Index for fast lookup by property
CREATE INDEX IF NOT EXISTS idx_property_media_property_id ON public.property_media(property_id);
CREATE INDEX IF NOT EXISTS idx_property_media_review_status ON public.property_media(review_status);

-- Create the storage bucket for property media (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies: public read, authenticated upload to own folder,
-- admin delete any
DROP POLICY IF EXISTS "Property media public read" ON storage.objects;
CREATE POLICY "Property media public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-media');

DROP POLICY IF EXISTS "Property media authenticated upload" ON storage.objects;
CREATE POLICY "Property media authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-media');

DROP POLICY IF EXISTS "Property media owner update" ON storage.objects;
CREATE POLICY "Property media owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-media');

DROP POLICY IF EXISTS "Property media owner delete" ON storage.objects;
CREATE POLICY "Property media owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-media');
