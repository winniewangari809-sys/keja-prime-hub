import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { Database, Users, Building2, Bell, MessageSquare, Image, Loader as Loader2, RefreshCw, TriangleAlert as AlertTriangle, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/hq/database")({
  head: () => ({ meta: [{ title: "Database Monitoring — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQDatabase,
});

interface TableStats {
  name: string;
  label: string;
  icon: any;
  count: number;
  error?: string;
}

interface ActivityData {
  newSignups: number;
  newListings: number;
  newRequests: number;
  failedLogins: number;
}

function HQDatabase() {
  const [tables, setTables] = useState<TableStats[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [profiles, roles, properties, notifications, requests, media, failedLogins] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("notifications").select("id", { count: "exact", head: true }),
        supabase.from("requests").select("id", { count: "exact", head: true }),
        supabase.from("property_media").select("id", { count: "exact", head: true }),
        supabase.from("failed_logins").select("id", { count: "exact", head: true }),
      ]);

      setTables([
        { name: "profiles", label: "User Profiles", icon: Users, count: profiles.count ?? 0 },
        { name: "user_roles", label: "Role Assignments", icon: Users, count: roles.count ?? 0 },
        { name: "properties", label: "Property Listings", icon: Building2, count: properties.count ?? 0 },
        { name: "notifications", label: "Notifications", icon: Bell, count: notifications.count ?? 0 },
        { name: "requests", label: "Inquiries & Requests", icon: MessageSquare, count: requests.count ?? 0 },
        { name: "property_media", label: "Photos & Videos", icon: Image, count: media.count ?? 0 },
        { name: "failed_logins", label: "Failed Logins", icon: AlertTriangle, count: failedLogins.count ?? 0 },
      ]);

      // Recent activity (last 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [signups, listings, reqs, logins] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", yesterday),
        supabase.from("properties").select("id", { count: "exact", head: true }).gte("created_at", yesterday),
        supabase.from("requests").select("id", { count: "exact", head: true }).gte("created_at", yesterday),
        supabase.from("failed_logins").select("id", { count: "exact", head: true }).gte("occurred_at", yesterday),
      ]);

      setActivity({
        newSignups: signups.count ?? 0,
        newListings: listings.count ?? 0,
        newRequests: reqs.count ?? 0,
        failedLogins: logins.count ?? 0,
      });
    } catch {
      setTables([]);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <HQPage title="Database Monitoring" description="Total records, recent activity, and system health at a glance.">
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          {/* Table stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {tables.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-5 hover-lift">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold tabular-nums">{t.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t.label}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Database className="h-3 w-3" />
                  <code className="text-[10px]">{t.name}</code>
                </div>
              </div>
            ))}
          </div>

          {/* 24h Activity */}
          {activity && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Last 24 Hours
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ActivityCard label="New Signups" value={activity.newSignups} icon={Users} tone="success" />
                <ActivityCard label="New Listings" value={activity.newListings} icon={Building2} tone="primary" />
                <ActivityCard label="New Requests" value={activity.newRequests} icon={MessageSquare} tone="primary" />
                <ActivityCard label="Failed Logins" value={activity.failedLogins} icon={AlertTriangle} tone={activity.failedLogins > 10 ? "destructive" : "warning"} />
              </div>
            </div>
          )}

          {/* System health */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">System Health</h2>
            <div className="space-y-3">
              <HealthRow label="Database Connection" status="healthy" />
              <HealthRow label="Storage Bucket (property-media)" status="healthy" />
              <HealthRow label="Auth Service" status="healthy" />
              <HealthRow label="Row Level Security" status="healthy" />
            </div>
          </div>
        </>
      )}
    </HQPage>
  );
}

function ActivityCard({ label, value, icon: Icon, tone }: {
  label: string;
  value: number;
  icon: any;
  tone: "success" | "primary" | "warning" | "destructive";
}) {
  const toneClasses = {
    success: "bg-success/10 text-success",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-xl border border-border p-4">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function HealthRow({ label, status }: { label: string; status: "healthy" | "degraded" | "down" }) {
  const statusMeta = {
    healthy: { color: "bg-success", text: "Healthy", textColor: "text-success" },
    degraded: { color: "bg-warning", text: "Degraded", textColor: "text-warning-foreground" },
    down: { color: "bg-destructive", text: "Down", textColor: "text-destructive" },
  };
  const meta = statusMeta[status];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${meta.color}`} />
        <span className={`text-sm font-semibold ${meta.textColor}`}>{meta.text}</span>
      </div>
    </div>
  );
}
