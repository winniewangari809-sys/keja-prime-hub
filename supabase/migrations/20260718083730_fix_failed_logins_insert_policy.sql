/*
# Fix failed_logins INSERT RLS Policy Bypass

## Summary

The `failed_logins_insert_all` policy on `public.failed_logins` had `WITH CHECK (true)`, allowing any authenticated user to insert arbitrary records with any email/IP values. This effectively bypassed row-level security for INSERT operations.

## Security Change

The WITH CHECK clause now enforces that an authenticated user may only insert a failed login record where the `email` column matches their own auth email, OR the user holds an `hq`/`admin` role (who may log failed attempts for any user as part of security monitoring).

## Rationale

The failed_logins table tracks failed authentication attempts. Restricting inserts to:
- Self-reports: an authenticated user can log their own failed attempt (email matches their auth email)
- Admin/HQ oversight: privileged roles can insert records for any user as part of security monitoring

This prevents an authenticated attacker from injecting fake failed-login records for arbitrary email addresses, which could otherwise pollute audit logs or trigger false lockouts.
*/

DROP POLICY IF EXISTS "failed_logins_insert_all" ON public.failed_logins;
CREATE POLICY "failed_logins_insert_all" ON public.failed_logins
  FOR INSERT TO authenticated
  WITH CHECK (
    (email = auth.email())
    OR security.has_role(auth.uid(), 'hq'::app_role)
    OR security.has_role(auth.uid(), 'admin'::app_role)
  );
