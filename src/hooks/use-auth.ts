import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole =
  | "buyer"
  | "tenant"
  | "seller"
  | "landlord"
  | "agent"
  | "airbnb"
  | "commercial"
  | "hq"
  | "admin";

interface AuthState {
  user: User | null;
  role: AppRole | null;
  firstName: string | null;
  fullName: string | null;
  loading: boolean;
}

const roleDefaultDashboards: Record<AppRole, string> = {
  buyer: "/dashboard/buyer",
  tenant: "/dashboard/tenant",
  seller: "/dashboard/seller",
  landlord: "/dashboard/landlord",
  agent: "/dashboard/agent",
  airbnb: "/dashboard/airbnb",
  commercial: "/dashboard/commercial",
  hq: "/dashboard/admin",
  admin: "/dashboard/admin",
};

export function dashboardForRole(role: AppRole | null): string {
  if (!role) return "/login";
  return roleDefaultDashboards[role];
}

async function loadUserData(user: User) {
  let role: AppRole | null = null;
  let firstName: string | null = null;
  let fullName: string | null = null;

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleData) role = roleData.role as AppRole;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileData) {
    firstName = profileData.first_name;
    fullName = profileData.full_name;
  }

  return { role, firstName, fullName };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    role: null,
    firstName: null,
    fullName: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!isMounted) return;
        const currentUser = sessionData?.session?.user || null;

        if (currentUser) {
          const { role, firstName, fullName } = await loadUserData(currentUser);
          if (!isMounted) return;
          setAuth({ user: currentUser, role, firstName, fullName, loading: false });
        } else {
          setAuth({ user: null, role: null, firstName: null, fullName: null, loading: false });
        }
      } catch {
        if (isMounted) {
          setAuth({ user: null, role: null, firstName: null, fullName: null, loading: false });
        }
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user || null;

      if (currentUser) {
        (async () => {
          const { role, firstName, fullName } = await loadUserData(currentUser);
          if (!isMounted) return;
          setAuth({ user: currentUser, role, firstName, fullName, loading: false });
        })();
      } else {
        setAuth({ user: null, role: null, firstName: null, fullName: null, loading: false });
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuth({ user: null, role: null, firstName: null, fullName: null, loading: false });
  };

  return {
    user: auth.user,
    role: auth.role,
    firstName: auth.firstName,
    fullName: auth.fullName,
    loading: auth.loading,
    signOut,
  };
}
