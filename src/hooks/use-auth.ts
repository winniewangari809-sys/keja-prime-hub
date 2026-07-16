import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "buyer" | "tenant" | "seller" | "landlord" | "agent" | "airbnb" | "commercial" | "hq" | "admin";

export interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  firstName: string | null;
  fullName: string | null;
}

const roleHome: Record<AppRole, string> = {
  buyer: "/dashboard/buyer",
  tenant: "/dashboard/tenant",
  seller: "/dashboard/seller",
  landlord: "/dashboard/landlord",
  agent: "/dashboard/agent",
  airbnb: "/dashboard/landlord",
  commercial: "/dashboard/seller",
  hq: "/dashboard/admin",
  admin: "/dashboard/admin",
};

export function dashboardForRole(role: AppRole | null): string {
  return role ? roleHome[role] : "/dashboard/buyer";
}

async function loadRoleAndProfile(
  user: User | null,
  retries = 2,
): Promise<{ role: AppRole | null; firstName: string | null; fullName: string | null }> {
  if (!user) return { role: null, firstName: null, fullName: null };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const [{ data: roleRow, error: roleError }, { data: profile }] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("first_name, full_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (roleRow?.role) {
      return {
        role: roleRow.role as AppRole,
        firstName: profile?.first_name ?? null,
        fullName: profile?.full_name ?? null,
      };
    }

    if (roleError && attempt < retries) {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      continue;
    }

    if (!roleRow && attempt < retries) {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      continue;
    }
  }

  return { role: null, firstName: null, fullName: null };
}

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    user: null,
    role: null,
    firstName: null,
    fullName: null,
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const user = session?.user ?? null;
      setState((s) => ({
        ...s,
        session,
        user,
        loading: true,
      }));
      setUserId(user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const user = data.session?.user ?? null;
      setState((s) => ({
        ...s,
        session: data.session,
        user,
        loading: !!user,
      }));
      setUserId(user?.id ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setState((s) => ({
        ...s,
        role: null,
        firstName: null,
        fullName: null,
        loading: false,
      }));
      return;
    }

    let cancelled = false;

    (async () => {
      const extras = await loadRoleAndProfile(state.user ?? null);
      if (cancelled) return;
      setState((s) => ({
        ...s,
        role: extras.role,
        firstName: extras.firstName,
        fullName: extras.fullName,
        loading: false,
      }));
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signOut };
}
