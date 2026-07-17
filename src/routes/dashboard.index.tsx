import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome{user ? `, ${user.email}` : ""}!
      </p>
    </div>
  );
}
