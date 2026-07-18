import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole =
  | "buyer" | "tenant" | "seller" | "landlord"
  | "agent" | "airbnb" | "commercial" | "hq" | "admin";

interface AuthContextValue {
  user: User | null;
  role: AppRole | null;
  firstName: string | null;
  fullName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, role: null, firstName: null, fullName: null,
  loading: true, signOut: async () => {},
});

async function loadUserData(user: User) {
  let role: AppRole | null = null;
  let firstName: string | null = null;
  let fullName: string | null = null;

  const { data: roleData } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (roleData) role = roleData.role as AppRole;

  const { data: profileData } = await supabase
    .from("profiles").select("first_name, full_name").eq("id", user.id).maybeSingle();
  if (profileData) {
    firstName = profileData.first_name;
    fullName = profileData.full_name;
  }
  return { role, firstName, fullName };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const currentUser = data?.session?.user || null;
        if (currentUser) {
          const ud = await loadUserData(currentUser);
          if (!mounted) return;
          setUser(currentUser);
          setRole(ud.role);
          setFirstName(ud.firstName);
          setFullName(ud.fullName);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      if (currentUser) {
        (async () => {
          const ud = await loadUserData(currentUser);
          if (!mounted) return;
          setUser(currentUser);
          setRole(ud.role);
          setFirstName(ud.firstName);
          setFullName(ud.fullName);
          setLoading(false);
        })();
      } else {
        setUser(null); setRole(null); setFirstName(null); setFullName(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setRole(null); setFirstName(null); setFullName(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, firstName, fullName, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
