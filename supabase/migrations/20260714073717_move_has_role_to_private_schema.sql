/*
# Move has_role to private schema (not exposed via REST)

## Purpose
The `has_role` function must remain SECURITY DEFINER to avoid infinite RLS
recursion on `user_roles` (the "admins read all" policy calls `has_role`,
which queries `user_roles`). However, being in the `public` schema makes it
callable by any authenticated user via `/rest/v1/rpc/has_role`.

Moving the function to a dedicated `security` schema removes it from the
PostgREST API surface (PostgREST only exposes the `public` schema by default)
while keeping it available for internal RLS policy evaluation.

## Changes
1. Create `security` schema.
2. Recreate `has_role` in `security` schema (SECURITY DEFINER + self-check guard).
3. Grant EXECUTE to `authenticated` (needed for RLS policy evaluation).
4. Drop the dependent RLS policy, then drop `public.has_role`.
5. Recreate the "admins read all" RLS policy calling `security.has_role(...)`.

## Security
- Function is no longer reachable via `/rest/v1/rpc/has_role`.
- Self-check guard remains: returns false if `_user_id != auth.uid()`.
- RLS policies continue to work unchanged.
*/

-- 1. Create private schema
CREATE SCHEMA IF NOT EXISTS security;

-- 2. Create has_role in security schema (SECURITY DEFINER + self-check guard)
CREATE OR REPLACE FUNCTION security.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select case
    when _user_id = auth.uid() then
      exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
    else
      false
  end
$function$;

-- 3. Grant EXECUTE to authenticated (needed for RLS policy evaluation)
GRANT EXECUTE ON FUNCTION security.has_role(uuid, public.app_role) TO authenticated;

-- 4. Drop dependent policy first, then drop public.has_role
DROP POLICY IF EXISTS "Roles: admins read all" ON public.user_roles;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5. Recreate RLS policy using schema-qualified function name
CREATE POLICY "Roles: admins read all"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    security.has_role(auth.uid(), 'admin'::public.app_role)
    OR security.has_role(auth.uid(), 'hq'::public.app_role)
  );
