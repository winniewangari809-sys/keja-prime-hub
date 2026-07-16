import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, X, Hop as Home, KeyRound, Building2, Briefcase, ShieldCheck, Loader as Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRequireRole } from "@/hooks/use-require-role";
import { useTestMode } from "@/hooks/use-test-mode";
import { WelcomeSection } from "@/components/site/DashboardShared";
import type { AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/test-mode")({
  head: () => ({ meta: [{ title: "Test Mode — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: TestModePage,
});

const previewRoles: { role: AppRole; label: string; icon: typeof Home; desc: string }[] = [
  { role: "buyer", label: "Buyer Dashboard", icon: Home, desc: "Property seekers looking to buy" },
  { role: "tenant", label: "Tenant Dashboard", icon: KeyRound, desc: "Renters looking for rentals" },
  { role: "seller", label: "Seller Dashboard", icon: Building2, desc: "Property owners selling" },
  { role: "landlord", label: "Landlord Dashboard", icon: Building2, desc: "Rental property managers" },
  { role: "agent", label: "Agent Dashboard", icon: Briefcase, desc: "Agents managing client listings" },
  { role: "admin", label: "HQ Dashboard", icon: ShieldCheck, desc: "Admin command center" },
];

const dashboardRoutes: Record<AppRole, string> = {
  buyer: "/dashboard/buyer",
  tenant: "/dashboard/tenant",
  seller: "/dashboard/seller",
  landlord: "/dashboard/landlord",
  agent: "/dashboard/agent",
  hq: "/dashboard/admin",
  admin: "/dashboard/admin",
};

function TestModePage() {
  const auth = useRequireRole(["hq", "admin"]);
  const { enterTestMode, isTestMode, previewRole, exitTestMode } = useTestMode();
  const navigate = useNavigate();

  if (auth.loading || !auth.user) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  function handlePreview(role: AppRole) {
    enterTestMode(role);
    navigate({ to: dashboardRoutes[role] as any });
  }

  return (
    <section className="container-app py-10 space-y-8">
      <WelcomeSection firstName={auth.firstName || "Admin"} role={auth.role ?? "admin"} subtitle="Preview any role's dashboard without creating multiple accounts." />

      {isTestMode && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-700">Currently previewing as: <span className="capitalize">{previewRole}</span></span>
          </div>
          <button onClick={() => { exitTestMode(); navigate({ to: "/dashboard/admin" }); }} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-3 py-1.5 text-sm font-semibold hover:bg-amber-600 transition-colors">
            <X className="h-4 w-4" /> Exit Test Mode
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {previewRoles.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.role}
              onClick={() => handlePreview(r.role)}
              className="group rounded-2xl border border-border bg-card p-6 text-left hover-lift transition-all"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{r.label}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                Preview <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
