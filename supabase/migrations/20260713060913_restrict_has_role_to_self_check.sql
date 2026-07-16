/*
# Restrict has_role to self-checks only

## Purpose
The `has_role(_user_id, _role)` function is SECURITY DEFINER so it can bypass
RLS on `user_roles` (the "admins read all" policy calls it, which would infinitely
recurse under SECURITY INVOKER). However, because it accepts an arbitrary
`_user_id` parameter, any authenticated user can call it via
`/rest/v1/rpc/has_role` to check whether ANY other user has a given role —
an information disclosure vulnerability.

## Fix
Add a guard inside the function body: if `_user_id` does not match `auth.uid()`,
return `false` immediately. This preserves the function's use in RLS policies
(which always pass `auth.uid()` as the first argument) while preventing users
from probing other users' roles through the REST API.

The `service_role` and `postgres` roles bypass RLS entirely and can query
`user_roles` directly, so they do not need `has_role` for cross-user checks.

## Security
- No new tables or columns.
- No RLS policy changes.
- EXECUTE privilege on `has_role` remains granted to `authenticated` (needed
  for policy evaluation) but the function body now prevents cross-user checks.
*/
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Prevent cross-user role probing: only allow checking the caller's own role.
  -- RLS policies always pass auth.uid() as _user_id, so this guard is transparent
  -- to legitimate policy usage. service_role bypasses RLS and can query
  -- user_roles directly without this function.
  select case
    when _user_id = auth.uid() then
      exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
    else
      false
  end
$function$;
