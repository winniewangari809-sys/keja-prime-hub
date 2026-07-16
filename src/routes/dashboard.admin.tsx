import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, Building2, Flag, BadgeCheck, BellRing, Lock, ClipboardList, MessageSquare, TrendingUp, DollarSign, Sparkles, Activity, ShieldCheck, HeartHandshake, Search as SearchIcon, Zap, Loader as Loader2, Hop as Home, KeyRound, Briefcase, Eye, Image, Star, Database, TriangleAlert as AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRequireRole } from "@/hooks/use-require-role";
import { WelcomeSection, QuickActionGrid, StatGrid, type StatItem } from "@/components/site/DashboardShared";
import { useTestMode } from "@/hooks/use-test-mode";
import { HQActivityFeed } from "@/components/site/HQActivityFeed";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "KejaHub HQ — CEO Console" }, { name: "robots", content: "noindex" }] }),
  component: KejaHubHQ,
});

const quickActions = [
  { to: "/hq/users", icon: Users, label: "User Management", desc: "Manage accounts" },
  { to: "/hq/listings", icon: Building2, label: "Listings", desc: "All properties" },
  { to: "/hq/viewings", icon: Calendar, label: "Viewing Requests", desc: "Manage viewings & concierge" },
  { to: "/hq/media", icon: Image, label: "Media Control", desc: "Review photos & videos" },
  { to: "/hq/featured", icon: Star, label: "Featured", desc: "Promote listings" },
  { to: "/hq/notifications", icon: BellRing, label: "Notifications", desc: "Send announcements" },
  { to: "/hq/emergency", icon: AlertTriangle, label: "Emergency", desc: "Kill switches" },
];

const PIE_COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#84cc16", "#f59e0b", "#ef4444"];

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  totalLandlords: number;
  totalBuyers: number;
  totalTenants: number;
  totalSellers: number;
  pendingRequests: number;
  verifiedAgents: number;
  roleDistribution: { name: string; value: number }[];
  recentUsers: { id: string; email: string; role: string; created_at: string }[];
  recentProperties: { id: string; title: string; status: string; created_at: string }[];
  recentRequests: { id: string; type: string; status: string; created_at: string }[];
}

function KejaHubHQ() {
  const auth = useRequireRole(["hq", "admin"]);
  const { isTestMode, previewRole, exitTestMode } = useTestMode();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [profiles, roles, properties, requests] = await Promise.all([
          supabase.from("profiles").select("id, email, created_at"),
          supabase.from("user_roles").select("user_id, role, created_at"),
          supabase.from("properties").select("id, title, status, created_at"),
          supabase.from("requests").select("id, type, status, created_at"),
        ]);

        const roleRows = roles.data ?? [];
        const roleDist: Record<string, number> = {};
        for (const r of roleRows) roleDist[r.role] = (roleDist[r.role] ?? 0) + 1;

        setStats({
          totalUsers: (profiles.data ?? []).length,
          totalProperties: (properties.data ?? []).length,
          totalAgents: roleDist["agent"] ?? 0,
          totalLandlords: roleDist["landlord"] ?? 0,
          totalBuyers: roleDist["buyer"] ?? 0,
          totalTenants: roleDist["tenant"] ?? 0,
          totalSellers: roleDist["seller"] ?? 0,
          pendingRequests: (requests.data ?? []).filter((r: any) => r.status === "pending").length,
          verifiedAgents: roleDist["agent"] ?? 0,
          roleDistribution: Object.entries(roleDist).map(([name, value]) => ({ name, value })),
          recentUsers: (profiles.data ?? []).slice(-5).reverse(),
          recentProperties: (properties.data ?? []).slice(-5).reverse(),
          recentRequests: (requests.data ?? []).slice(-5).reverse(),
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (auth.loading || (!auth.user && !isTestMode)) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  const displayName = auth.firstName || (isTestMode ? "Test" : "Admin");

  const statItems: StatItem[] = stats ? [
    { icon: Users, label: "Total Users", value: stats.totalUsers },
    { icon: Building2, label: "Total Properties", value: stats.totalProperties },
    { icon: ClipboardList, label: "Pending Requests", value: stats.pendingRequests, tone: "warning" },
    { icon: BadgeCheck, label: "Verified Agents", value: stats.verifiedAgents },
  ] : [
    { icon: Users, label: "Total Users", value: 0 },
    { icon: Building2, label: "Total Properties", value: 0 },
    { icon: ClipboardList, label: "Pending Requests", value: 0, tone: "warning" },
    { icon: BadgeCheck, label: "Verified Agents", value: 0 },
  ];

  return (
    <>
      {isTestMode && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-3">
          <Eye className="h-4 w-4" /> TEST MODE — Previewing as {previewRole}
          <button onClick={exitTestMode} className="ml-2 rounded-md bg-white/20 px-3 py-1 text-xs hover:bg-white/30 transition-colors">
            Return to HQ Dashboard
          </button>
        </div>
      )}

      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 night-skyline pointer-events-none" aria-hidden />
        <div className="container-app relative py-10 md:py-14">
          <WelcomeSection firstName={displayName} role={auth.role ?? "admin"} subtitle="A structured view of everything that matters — users, listings, priorities, and system health." />
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/hq/analytics" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover-lift"><TrendingUp className="h-4 w-4" /> Analytics</Link>
            <Link to="/hq/revenue" className="inline-flex items-center gap-1.5 rounded-full gradient-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-soft"><DollarSign className="h-4 w-4" /> Revenue</Link>
          </div>
        </div>
      </section>

      <section className="container-app py-10 space-y-12">
        {loading ? (
          <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : (
          <>
            <QuickActionGrid actions={quickActions} />
            <StatGrid stats={statItems} />

            {/* Role breakdown cards */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">User Breakdown</h2>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <RoleCard icon={Users} label="Buyers" value={stats?.totalBuyers ?? 0} />
                <RoleCard icon={KeyRound} label="Tenants" value={stats?.totalTenants ?? 0} />
                <RoleCard icon={Home} label="Sellers" value={stats?.totalSellers ?? 0} />
                <RoleCard icon={Building2} label="Landlords" value={stats?.totalLandlords ?? 0} />
                <RoleCard icon={Briefcase} label="Agents" value={stats?.totalAgents ?? 0} />
                <RoleCard icon={Users} label="Total" value={stats?.totalUsers ?? 0} />
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Role distribution pie chart */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4">User Distribution by Role</h3>
                {stats && stats.roleDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={stats.roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {stats.roleDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">No user data yet</div>
                )}
              </div>

              {/* Property status bar chart */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4">Property Status Overview</h3>
                {stats && stats.totalProperties > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: "Available", count: stats.totalProperties },
                      { name: "Pending", count: stats.pendingRequests },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="oklch(0.65 0.18 245)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">No property data yet</div>
                )}
              </div>
            </div>

            {/* Recent activity tables */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent users */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Recent Users</h3>
                {stats && stats.recentUsers.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {stats.recentUsers.map((u) => (
                      <li key={u.id} className="rounded-lg border border-border p-3">
                        <p className="font-medium truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No users yet</p>}
              </div>

              {/* Recent properties */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Recent Listings</h3>
                {stats && stats.recentProperties.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {stats.recentProperties.map((p) => (
                      <li key={p.id} className="rounded-lg border border-border p-3">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.status}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No listings yet</p>}
              </div>

              {/* Recent requests */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Recent Requests</h3>
                {stats && stats.recentRequests.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {stats.recentRequests.map((r) => (
                      <li key={r.id} className="rounded-lg border border-border p-3">
                        <p className="font-medium capitalize">{r.type}</p>
                        <p className="text-xs text-muted-foreground capitalize">{r.status}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No requests yet</p>}
              </div>
            </div>

            {/* HQ Activity Feed */}
            <HQActivityFeed />

            {/* Operational modules */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Operations</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { to: "/hq/users",              i: Users,          t: "User Management",           d: "All users" },
                  { to: "/hq/listings",           i: Building2,      t: "Listing Management",        d: "All properties" },
                  { to: "/hq/viewings",           i: Calendar,       t: "Viewing Requests",          d: "Manage viewings & concierge" },
                  { to: "/hq/media",              i: Image,           t: "Media Control",             d: "Photos & videos" },
                  { to: "/hq/featured",           i: Star,            t: "Featured Listings",         d: "Promote & pin" },
                  { to: "/hq/verifications",      i: BadgeCheck,     t: "Verification Center",       d: "Review process" },
                  { to: "/hq/notifications",      i: BellRing,        t: "Notification Center",      d: "Send announcements" },
                  { to: "/hq/messages",           i: MessageSquare,  t: "Messages",                  d: "All conversations" },
                  { to: "/hq/support",            i: SearchIcon,     t: "Support Center",            d: "Help requests" },
                  { to: "/hq/reports",            i: Flag,           t: "Reports & Trust",           d: "Investigate offenders" },
                  { to: "/hq/security",           i: Lock,           t: "Security",                  d: "Activity logs" },
                  { to: "/hq/analytics",          i: TrendingUp,     t: "Business Intelligence",     d: "Market insights" },
                  { to: "/hq/revenue",            i: DollarSign,    t: "Revenue",                   d: "Billing & payments" },
                  { to: "/hq/database",           i: Database,      t: "Database Monitor",          d: "Table stats & health" },
                  { to: "/hq/emergency",          i: AlertTriangle, t: "Emergency Control",         d: "Kill switches" },
                  { to: "/dashboard/test-mode",   i: Eye,            t: "Test Mode",                 d: "Preview dashboards" },
                ].map((m) => (
                  <Link key={m.t} to={m.to as any} className="rounded-2xl border border-border bg-card p-5 hover-lift block">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><m.i className="h-5 w-5" /></div>
                    <p className="mt-4 font-semibold">{m.t}</p>
                    <p className="text-sm text-muted-foreground">{m.d}</p>
                    <p className="mt-4 text-sm font-semibold text-primary">Open →</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function RoleCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover-lift">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
        <div>
          <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
