import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth, dashboardForRole, type AppRole } from "./use-auth";
import { useTestMode } from "./use-test-mode";

/**
 * Redirect users who are not signed in to /login, and signed-in users
 * without one of the allowed roles to their own dashboard.
 * In test mode, the preview role is used instead of the real role,
 * and unauthenticated access is allowed.
 */
export function useRequireRole(allowed: AppRole[]) {
  const auth = useAuth();
  const { isTestMode, previewRole } = useTestMode();
  const navigate = useNavigate();

  const effectiveRole = isTestMode ? previewRole : auth.role;

  useEffect(() => {
    // In test mode, allow unauthenticated access if the preview role is allowed
    if (isTestMode && previewRole && allowed.includes(previewRole)) {
      return;
    }

    if (auth.loading) return;
    if (!auth.user) {
      navigate({ to: "/login", search: { next: window.location.pathname } as any });
      return;
    }
    if (!effectiveRole) {
      toast.error("Your account has no role assigned. Please contact support.");
      navigate({ to: "/login" });
      return;
    }
    if (!allowed.includes(effectiveRole)) {
      if (isTestMode) {
        navigate({ to: "/preview" });
        return;
      }
      toast.error("You don't have access to that dashboard.");
      navigate({ to: dashboardForRole(auth.role) as any });
    }
  }, [auth.loading, auth.user, effectiveRole, allowed, navigate, isTestMode, previewRole]);

  return { ...auth, role: effectiveRole };
}
