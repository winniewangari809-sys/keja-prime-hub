/*
# Add unique constraint on user_roles.user_id (one role per user)

## Purpose
The existing constraint `user_roles_user_id_role_key` is UNIQUE on
`(user_id, role)` — it prevents duplicate *identical* rows but still allows
a single user to have multiple *different* roles. The frontend queries
`.eq("user_id", ...).limit(1).maybeSingle()`, which would throw if two rows
matched. A unique constraint on `user_id` alone guarantees one role per user,
which is the application's design.

## Changes
1. Creates a unique index on `user_roles(user_id)` only.
2. Adds the corresponding unique constraint.

## Security
No RLS policy changes. Existing policies remain intact.
*/

CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_one_role_per_user_idx"
  ON public.user_roles (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_one_role_per_user'
      AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT "user_roles_one_role_per_user" UNIQUE USING INDEX "user_roles_one_role_per_user_idx";
  END IF;
END $$;
