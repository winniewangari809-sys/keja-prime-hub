import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type AppRole } from "./use-auth";

export function useRequireRole(roles: AppRole[]) {
  const navigate = useNavigate();
  const { user, role, firstName, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/login");
      else if (!roles.includes(role as AppRole)) navigate("/");
    }
  }, [loading, user, role, roles, navigate]);

  return { loading, user, role, firstName };
}
