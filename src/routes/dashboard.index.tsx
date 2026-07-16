import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader as Loader2 } from "lucide-react";
import { useAuth, dashboardForRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: DashboardRouter,
});

function DashboardRouter() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) { navigate({ to: "/login" }); return; }
    if (!auth.role) {
      // Authenticated but role missing — don't silently default, show error
      return;
    }
    navigate({ to: dashboardForRole(auth.role) as any, replace: true });
  }, [auth.loading, auth.user, auth.role, navigate]);

  if (!auth.loading && auth.user && !auth.role) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center px-4">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">No role assigned</p>
          <p className="text-muted-foreground">
            Your account doesn't have a role yet. Please contact support to get access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
      <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading your dashboard…</div>
    </div>
  );
}
