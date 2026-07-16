import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, X, Hop as Home, KeyRound, Building2, Briefcase, ShieldCheck, Store, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTestMode } from "@/hooks/use-test-mode";
import type { AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/preview")({
  head: () => ({ meta: [{ title: "Dashboard Preview — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: PreviewPage,
});

const dashboards: { role: AppRole; label: string; icon: typeof Home; desc: string; href: string }[] = [
  { role: "buyer",    label: "Buyer Dashboard",    icon: Home,         desc: "Property seekers looking to buy",   href: "/dashboard/buyer" },
  { role: "tenant",   label: "Tenant Dashboard",   icon: KeyRound,     desc: "Renters looking for rentals",       href: "/dashboard/tenant" },
  { role: "agent",    label: "Agent Dashboard",    icon: Briefcase,    desc: "Agents managing client listings",   href: "/dashboard/agent" },
  { role: "landlord", label: "Landlord Dashboard", icon: Building2,   desc: "Rental property managers",          href: "/dashboard/landlord" },
  { role: "hq",       label: "BnB Dashboard",      icon: Store,        desc: "Airbnb and short-stay hosts",        href: "/dashboard/admin" },
  { role: "admin",    label: "Commercial Dashboard", icon: Building2,  desc: "Commercial property managers",      href: "/dashboard/admin" },
  { role: "admin",    label: "Admin Dashboard",   icon: ShieldCheck,  desc: "HQ command center",                 href: "/dashboard/admin" },
];

function PreviewPage() {
  const { enterTestMode, isTestMode, previewRole, exitTestMode } = useTestMode();
  const navigate = useNavigate();

  function handlePreview(role: AppRole, href: string) {
    enterTestMode(role);
    navigate({ to: href as any });
  }

  return (
    <section className="container-app py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
          <Eye className="h-3.5 w-3.5" /> TEST MODE
        </span>
        <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold">Dashboard Preview</h1>
        <p className="mt-2 text-muted-foreground">
          Preview any dashboard without creating an account. These buttons bypass authentication for testing purposes.
        </p>
      </div>

      {isTestMode && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between max-w-2xl mx-auto">
          <span className="font-semibold text-amber-700">Currently previewing as: <span className="capitalize">{previewRole}</span></span>
          <button onClick={() => { exitTestMode(); navigate({ to: "/" }); }} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-3 py-1.5 text-sm font-semibold hover:bg-amber-600 transition-colors">
            <X className="h-4 w-4" /> Exit
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {dashboards.map((d, i) => {
          const Icon = d.icon;
          return (
            <button
              key={i}
              onClick={() => handlePreview(d.role, d.href)}
              className="group rounded-2xl border border-border bg-card p-6 text-left hover-lift transition-all"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{d.label}</h3>
              <p className="text-sm text-muted-foreground">{d.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                Preview <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center max-w-2xl mx-auto pt-4">
        <p className="text-sm text-muted-foreground mb-4">Ready to use KejaHub for real?</p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
