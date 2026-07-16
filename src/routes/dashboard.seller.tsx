import { createFileRoute, Link } from "@tanstack/react-router";
import { properties, statusMeta, type PropertyStatus } from "@/lib/mock-data";
import { Eye, Heart, MessageCircle, TrendingUp, BadgeCheck, Crown, Plus, Hop as HomeIcon, Building2, Store, Bed, Loader as Loader2, Wallet, Users, Bell, Settings, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ListingCoach } from "@/components/site/ListingCoach";
import { VerificationCenter } from "@/components/site/VerificationCenter";
import { PromoteListing } from "@/components/site/PromoteListing";
import { ListingPerformance } from "@/components/site/ListingPerformance";
import { toast } from "sonner";
import { Circle as HelpCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useTestMode } from "@/hooks/use-test-mode";
import { WelcomeSection, QuickActionGrid, StatGrid, type StatItem } from "@/components/site/DashboardShared";

export const Route = createFileRoute("/dashboard/seller")({
  head: () => ({ meta: [{ title: "Seller Dashboard — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: SellerDashboard,
});

const stats: StatItem[] = [
  { icon: Building2, label: "Total Properties", value: 28 },
  { icon: Eye, label: "Property Views", value: 4238, delta: "+12.4%" },
  { icon: MessageCircle, label: "Buyer Requests", value: 34, delta: "+22%" },
  { icon: BadgeCheck, label: "Verified Listings", value: 6, suffix: "/8" },
];

const quickActions = [
  { to: "/post-listing", icon: Plus, label: "Add New Property", desc: "Create a listing" },
  { to: "/rentals", icon: HomeIcon, label: "My Properties", desc: "Manage listings" },
  { to: "/notifications", icon: Eye, label: "Property Views", desc: "Analytics" },
  { to: "/notifications", icon: Users, label: "Buyer Requests", desc: "Inquiries" },
  { to: "/notifications", icon: Star, label: "Promote Listing", desc: "Boost visibility" },
  { to: "/notifications", icon: BadgeCheck, label: "Verification", desc: "Verify account" },
];

const portfolioBuckets = [
  { i: Bed,        label: "Bedsitters",   count: 8, icon: "🛏" },
  { i: Bed,        label: "Studios",      count: 3, icon: "🚪" },
  { i: HomeIcon,   label: "1 Bedrooms",   count: 6, icon: "🏠" },
  { i: HomeIcon,   label: "2 Bedrooms",   count: 5, icon: "🏘" },
  { i: HomeIcon,   label: "3 Bedrooms",   count: 3, icon: "🏡" },
  { i: HomeIcon,   label: "4+ Bedrooms",  count: 1, icon: "🏰" },
  { i: Building2,  label: "Airbnbs",      count: 2, icon: "✈️" },
  { i: Store,      label: "Commercial",   count: 2, icon: "🏢" },
];

const buyerRequests = [
  { name: "Peter K.", property: "Kilimani 2BR", time: "1h ago", message: "Is the unit still available?" },
  { name: "Sarah M.", property: "Ruiru Bedsitter", time: "3h ago", message: "Can I schedule a viewing?" },
  { name: "John O.", property: "Diani Airbnb", time: "5h ago", message: "What are the weekend rates?" },
];

const STATUSES: PropertyStatus[] = ["available", "pending", "reserved", "sold", "rented"];

function SellerDashboard() {
  const auth = useRequireRole(["seller", "commercial"]);
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
      <WelcomeSection firstName={displayName} role={auth.role ?? "seller"} subtitle="Track performance, respond to inquiries and manage every listing in one place." />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={stats} />

      {/* Listing Performance */}
      <ListingPerformance />

      {/* Promote Listing */}
      <PromoteListing />

      {/* Buyer requests */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" /> Recent Buyer Requests
        </h3>
        <div className="space-y-3">
          {buyerRequests.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent transition-colors">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{r.property}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{r.message}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{r.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio buckets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Your portfolio</h2>
          <Button asChild className="gradient-primary text-primary-foreground"><Link to="/post-listing"><Plus className="h-4 w-4" /> New listing</Link></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {portfolioBuckets.map((b, i) => (
            <div key={b.label} className="rounded-2xl border border-border bg-card p-4 hover-lift animate-fade-up" style={{ animationDelay: `${i*40}ms` }}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-lg">{b.icon}</span>
                <div>
                  <p className="text-xs text-muted-foreground">{b.label}</p>
                  <p className="font-display text-2xl font-bold">{b.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Center */}
      <VerificationCenter userId={auth.user?.id} />

      {/* Listing coach for top 3 */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Listing coach</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {properties.slice(0, 3).map((p) => <ListingCoach key={p.id} p={p} />)}
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
                <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No properties in this bucket.</td></tr>
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
