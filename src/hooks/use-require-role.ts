import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "./use-auth";

interface RequireRoleResult {
  loading: boolean;
  user: ReturnType<typeof useAuth>["user"];
  role: AppRole | null;
  firstName: string | null;
}

export function useRequireRole(roles: AppRole[]): RequireRoleResult {
  const navigate = useNavigate();
  const { user, role, firstName, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (!roles.includes(role as AppRole)) {
        navigate({ to: "/" });
      }
    }
  }, [loading, user, role, roles, navigate]);

  return {
    loading,
    user,
    role,
    firstName,
  };
}
