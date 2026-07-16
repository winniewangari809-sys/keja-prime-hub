import { createFileRoute, Link } from "@tanstack/react-router";
import { properties, statusMeta, type PropertyStatus } from "@/lib/mock-data";
import { Eye, MessageCircle, TrendingUp, BadgeCheck, Crown, Plus, Hop as HomeIcon, Building2, Loader as Loader2, Wallet, Users, Bell, Settings, DollarSign, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useTestMode } from "@/hooks/use-test-mode";
import { WelcomeSection, QuickActionGrid, StatGrid, type StatItem } from "@/components/site/DashboardShared";
import { VerificationCenter } from "@/components/site/VerificationCenter";
import { PromoteListing } from "@/components/site/PromoteListing";
import { ListingPerformance } from "@/components/site/ListingPerformance";

export const Route = createFileRoute("/dashboard/agent")({
  head: () => ({ meta: [{ title: "Agent Dashboard — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: AgentDashboard,
});

const stats: StatItem[] = [
  { icon: Building2, label: "Managed Listings", value: 18 },
  { icon: Eye, label: "Total Views", value: 5402, delta: "+15.2%" },
  { icon: MessageCircle, label: "New Inquiries", value: 27, delta: "+30%" },
  { icon: Users, label: "Assigned Leads", value: 12 },
];

const quickActions = [
  { to: "/post-listing", icon: Plus, label: "Add Listing", desc: "List for a client" },
  { to: "/rentals", icon: HomeIcon, label: "My Listings", desc: "Manage properties" },
  { to: "/notifications", icon: Users, label: "Assigned Leads", desc: "Your prospects" },
  { to: "/notifications", icon: Eye, label: "Viewing Schedules", desc: "Upcoming visits" },
  { to: "/notifications", icon: Star, label: "Promote Listing", desc: "Boost visibility" },
  { to: "/notifications", icon: BadgeCheck, label: "Verification", desc: "Verify account" },
];

const assignedLeads = [
  { name: "Peter K.", interest: "2BR Kilimani", time: "1h ago", message: "Wants to schedule a viewing" },
  { name: "Sarah M.", interest: "Bedsitter Ruiru", time: "3h ago", message: "Asked about deposit terms" },
  { name: "John O.", interest: "Diani Airbnb", time: "5h ago", message: "Inquiring about weekend rates" },
];

const viewingSchedule = [
  { property: "Kilimani 2BR", client: "Peter K.", time: "Today 2:00 PM" },
  { property: "Ruiru Studio", client: "Sarah M.", time: "Tomorrow 10:00 AM" },
  { property: "Westlands Office", client: "Tech Corp Ltd", time: "Tomorrow 3:00 PM" },
];

const STATUSES: PropertyStatus[] = ["available", "pending", "reserved", "sold", "rented"];

function AgentDashboard() {
  const auth = useRequireRole(["agent"]);
  const { isTestMode, previewRole, exitTestMode } = useTestMode();
  const [tab, setTab] = useState<PropertyStatus | "all">("all");
  const list = properties.filter((p) => tab === "all" ? true : p.status === tab);
  if (auth.loading || (!auth.user && !isTestMode)) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  const displayName = auth.firstName || (isTestMode ? "Test" : "there");
  const counts: Record<PropertyStatus | "all", number> = {
    all: properties.length,
    available: properties.filter(p => p.status === "available").length,
    pending: properties.filter(p => p.status === "pending").length,
    reserved: properties.filter(p => p.status === "reserved").length,
    sold: properties.filter(p => p.status === "sold").length,
    rented: properties.filter(p => p.status === "rented").length,
  };

  return (
    <section className="container-app py-10 space-y-10">
      {isTestMode && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-3 rounded-lg">
          <Eye className="h-4 w-4" /> TEST MODE — Previewing as {previewRole}
          <button onClick={exitTestMode} className="ml-2 rounded-md bg-white/20 px-3 py-1 text-xs hover:bg-white/30 transition-colors">
            Return To HQ Dashboard
          </button>
        </div>
      )}
      <WelcomeSection firstName={displayName} role={auth.role ?? "agent"} subtitle="Manage your clients' listings, track leads and coordinate viewing schedules." />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={stats} />

      {/* Listing Performance */}
      <ListingPerformance />

      {/* Promote Listing */}
      <PromoteListing />

      {/* Verification Center */}
      <VerificationCenter userId={auth.user?.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned leads */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Assigned Leads
          </h3>
          <div className="space-y-3">
            {assignedLeads.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent transition-colors">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{r.interest}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Viewing schedule */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Viewing Schedule
          </h3>
          <div className="space-y-3">
            {viewingSchedule.map((v) => (
              <div key={v.property} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent transition-colors">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <HomeIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{v.property}</p>
                  <p className="text-xs text-muted-foreground">Client: {v.client}</p>
                </div>
                <span className="text-xs font-semibold text-primary shrink-0">{v.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>All ({counts.all})</TabButton>
          {STATUSES.map((s) => (
            <TabButton key={s} active={tab === s} onClick={() => setTab(s)}>
              <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", statusMeta[s].dot)} />
              {statusMeta[s].label} ({counts[s]})
            </TabButton>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4 hidden md:table-cell">Type</th>
                <th className="p-4 hidden md:table-cell">Views</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-12 w-16 rounded-md object-cover" />
                      <div>
                        <p className="font-semibold line-clamp-1">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-xs">{p.propertyType ?? p.category}</td>
                  <td className="p-4 hidden md:table-cell"><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {Math.floor(Math.random() * 800) + 200}</span></td>
                  <td className="p-4">
                    {p.featured && <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning-foreground"><Crown className="h-3 w-3" /> Featured</span>}
                    {p.status && (
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold", statusMeta[p.status].color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta[p.status].dot)} />
                        {statusMeta[p.status].label}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No properties in this status.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"
      )}
    >{children}</button>
  );
}
