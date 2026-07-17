import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, dashboardForRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      {
        title: "Dashboard — KejaHub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: DashboardIndex,
});

function DashboardIndex() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else {
        navigate({ to: dashboardForRole(role) });
      }
    }
  }, [loading, user, role, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
