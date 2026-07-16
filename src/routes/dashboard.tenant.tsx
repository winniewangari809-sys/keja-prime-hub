import { createFileRoute, Link } from "@tanstack/react-router";
import { properties } from "@/lib/mock-data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Heart, Search, Bell, MessageCircle, Eye, Sparkles, Settings, Loader as Loader2, MapPin, Clock, Users, Calendar, Hop as Home, Hotel, Store } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useTestMode } from "@/hooks/use-test-mode";
import { WelcomeSection, QuickActionGrid, StatGrid, type StatItem } from "@/components/site/DashboardShared";
import { ScheduledViewings } from "@/components/site/ScheduledViewings";
import { DashboardSearchBar } from "@/components/site/DashboardSearchBar";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/tenant")({
  head: () => ({ meta: [{ title: "Tenant Dashboard — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: TenantDashboard,
});

const stats: StatItem[] = [
  { icon: Heart, label: "Saved Rentals", value: 18, delta: "+2" },
  { icon: Search, label: "Active Searches", value: 4 },
  { icon: Eye, label: "Properties Viewed", value: 87, delta: "+9" },
  { icon: Calendar, label: "Scheduled Viewings", value: 1 },
];

const quickActions = [
  { to: "/rentals", icon: Home, label: "Find Rental", desc: "Search rentals" },
  { to: "/airbnbs", icon: Hotel, label: "Find Airbnb", desc: "Short stays" },
  { to: "/notifications", icon: Heart, label: "Saved Properties", desc: "Your favorites" },
  { to: "/notifications", icon: MessageCircle, label: "Messages", desc: "Chat with HQ" },
  { to: "/notifications", icon: Bell, label: "Viewing Approvals", desc: "Your scheduled visits" },
  { to: "/concierge", icon: Search, label: "Let KejaHub Find", desc: "We search for you" },
];

const recentSearches = [
  { query: "Bedsitter in Ruiru under 15k", time: "2h ago", results: 23 },
  { query: "2BR apartment in Kilimani", time: "1d ago", results: 47 },
  { query: "Studio in Westlands", time: "3d ago", results: 15 },
];

const contactedLandlords = [
  { name: "Amina Wanjiku", role: "Landlord", message: "Yes, viewings this Saturday work perfectly.", time: "2h", initials: "AW" },
  { name: "James Otieno", role: "Agent", message: "The unit is available from next month.", time: "1d", initials: "JO" },
  { name: "Grace Muthoni", role: "Landlord", message: "Deposit is one month's rent.", time: "3d", initials: "GM" },
];

function TenantDashboard() {
  const auth = useRequireRole(["tenant"]);
  const { isTestMode, previewRole, exitTestMode } = useTestMode();
  const [viewings, setViewings] = useState<any[]>([]);
  if (auth.loading || (!auth.user && !isTestMode)) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }
  const displayName = auth.firstName || (isTestMode ? "Test" : "there");
  const recommended = properties.filter(p => p.category === "rental").slice(0, 3);

  useEffect(() => {
    if (auth.user) {
      supabase
        .from("viewings")
        .select("id, property_title, preferred_date, preferred_time, status, notes, created_at")
        .eq("requester_id", auth.user!.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setViewings(data);
        });
    }
  }, [auth.user]);

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
      <WelcomeSection firstName={displayName} role="tenant" subtitle="Track rental searches, schedule viewings, and get personalized recommendations." />

      {/* Search bar */}
      <DashboardSearchBar />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={stats} />

      {/* Scheduled Viewings */}
      <ScheduledViewings viewings={viewings} viewerRole="buyer" />

      {/* Recommended rentals */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Recommended Rentals
          </h2>
          <Link to="/rentals" className="text-sm font-semibold text-primary hover:underline">Browse all →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </div>

      {/* Airbnb section for tenants */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Hotel className="h-5 w-5 text-primary" /> Airbnb Stays
          </h2>
          <Link to="/airbnbs" className="text-sm font-semibold text-primary hover:underline">Browse all Airbnb →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.filter(p => p.category === "airbnb").slice(0, 3).map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent searches */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Searches
          </h3>
          <div className="space-y-3">
            {recentSearches.map((s) => (
              <div key={s.query} className="rounded-xl border border-border p-3 hover:bg-accent transition-colors cursor-pointer">
                <p className="text-sm font-medium line-clamp-1">{s.query}</p>
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.results} results</span>
                  <span>{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacted landlords */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Contacted Landlords
          </h3>
          <div className="space-y-3">
            {contactedLandlords.map((a) => (
              <div key={a.name} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent transition-colors">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                  {a.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{a.name}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{a.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{a.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Notifications
        </h3>
        <ul className="space-y-3 text-sm">
          {[
            "New bedsitter listing matches your alert in Ruiru",
            "James responded to your rental inquiry",
            "Your viewing request for Kilimani 2BR was approved",
          ].map((n) => (
            <li key={n} className="rounded-lg bg-accent/50 p-3">{n}</li>
          ))}
        </ul>
        <button
          onClick={() => toast.info("Profile settings coming soon")}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm hover:bg-accent transition-colors"
        >
          <Settings className="h-4 w-4" /> Profile settings
        </button>
      </div>
    </section>
  );
}
