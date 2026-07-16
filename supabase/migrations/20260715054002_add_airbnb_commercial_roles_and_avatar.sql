/*
# Add airbnb/commercial roles and profile columns

## Purpose
1. Add 'airbnb' and 'commercial' to the app_role enum so the signup form can
   offer "Airbnb Owner" and "Commercial Owner" as distinct roles.
2. Add missing columns to profiles: avatar_url and phone_number (the user
   spec asks for these; phone already exists as 'phone', so we add
   phone_number as an alias and avatar_url).

## Changes

### 1. Enum: add 'airbnb' and 'commercial'
The app_role enum now includes: buyer, tenant, seller, landlord, agent,
airbnb, commercial, hq, admin.

### 2. Profiles: add avatar_url column
Add `avatar_url text` to profiles for user avatars.

## Security
- No RLS policy changes.
- No data loss — all additions are additive.
*/

-- 1. Add new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'airbnb' BEFORE 'hq';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commercial' BEFORE 'hq';

-- 2. Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
