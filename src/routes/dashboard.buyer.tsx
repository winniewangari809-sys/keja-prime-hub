import { createFileRoute, Link } from "@tanstack/react-router";
import { properties } from "@/lib/mock-data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Heart, Search, Bell, MessageCircle, Eye, Sparkles, Settings, Loader as Loader2, MapPin, Clock, Users, Calendar, Building2, Hop as Home, Hotel, Store, X } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { useTestMode } from "@/hooks/use-test-mode";
import { WelcomeSection, QuickActionGrid, StatGrid, type StatItem } from "@/components/site/DashboardShared";
import { ScheduledViewings } from "@/components/site/ScheduledViewings";
import { DashboardSearchBar } from "@/components/site/DashboardSearchBar";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/buyer")({
  head: () => ({ meta: [{ title: "Buyer Dashboard — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: BuyerDashboard,
});

const stats: StatItem[] = [
  { icon: Heart, label: "Saved Properties", value: 24, delta: "+3" },
  { icon: Search, label: "Active Requests", value: 3 },
  { icon: Eye, label: "Properties Viewed", value: 112, delta: "+18" },
  { icon: Calendar, label: "Scheduled Viewings", value: 2 },
];

const quickActions = [
  { to: "/rentals", icon: Home, label: "Find Rentals", desc: "Search rentals" },
  { to: "/homes-for-sale", icon: Building2, label: "Find Properties For Sale", desc: "Browse homes for sale" },
  { to: "/airbnbs", icon: Hotel, label: "Find Airbnb", desc: "Short stays" },
  { to: "/commercial-property", icon: Store, label: "Find Commercial Spaces", desc: "Offices & shops" },
  { to: "/notifications", icon: Heart, label: "Saved Properties", desc: "Your favorites" },
  { to: "/notifications", icon: MessageCircle, label: "Messages", desc: "Chat with HQ" },
];

const recentSearches = [
  { query: "2BR apartment in Kilimani", time: "2h ago", results: 47 },
  { query: "Bedsitter in Ruiru under 15k", time: "1d ago", results: 23 },
  { query: "Airbnb in Diani beachfront", time: "3d ago", results: 12 },
];

const contactedAgents = [
  { name: "Amina Wanjiku", role: "Listing Owner", message: "Yes, viewings this Saturday work perfectly.", time: "2h", initials: "AW" },
  { name: "James Otieno", role: "Agent", message: "Great, I've reserved the plot for you.", time: "1d", initials: "JO" },
  { name: "Grace Muthoni", role: "Host", message: "Check-in is 3PM. See you soon!", time: "3d", initials: "GM" },
];

function BuyerDashboard() {
  const auth = useRequireRole(["buyer"]);
  const { isTestMode, previewRole, exitTestMode } = useTestMode();
  const [viewings, setViewings] = useState<any[]>([]);
  if (auth.loading || (!auth.user && !isTestMode)) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }
  const displayName = auth.firstName || (isTestMode ? "Test" : "there");
  const recommended = properties.filter(p => p.featured).slice(0, 3);

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
      <WelcomeSection firstName={displayName} role="buyer" subtitle="Track saved properties, schedule viewings, and get personalized recommendations." />

      {/* Search bar */}
      <DashboardSearchBar />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={stats} />

      {/* Scheduled Viewings */}
      <ScheduledViewings viewings={viewings} viewerRole="buyer" />

      {/* Recommended properties */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Recommended for you
          </h2>
          <Link to="/rentals" className="text-sm font-semibold text-primary hover:underline">Browse all →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((p) => <PropertyCard key={p.id} p={p} />)}
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

        {/* Contacted agents */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Contacted Agents
          </h3>
          <div className="space-y-3">
            {contactedAgents.map((a) => (
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
            "New 2BR listing matches your alert in Ruiru",
            "James responded to your land inquiry",
            "Price drop on Kilimani penthouse",
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
