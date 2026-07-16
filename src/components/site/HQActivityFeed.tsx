import { useEffect, useState } from "react";
import { Activity, UserPlus, Building2, Calendar, Heart, BadgeCheck, Package, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

const activityIcons: Record<string, { icon: typeof UserPlus; color: string }> = {
  new_user: { icon: UserPlus, color: "bg-blue-500/10 text-blue-500" },
  new_listing: { icon: Building2, color: "bg-primary/10 text-primary" },
  viewing_requested: { icon: Calendar, color: "bg-amber-500/10 text-amber-600" },
  property_saved: { icon: Heart, color: "bg-rose-500/10 text-rose-500" },
  verification_requested: { icon: BadgeCheck, color: "bg-emerald-500/10 text-emerald-600" },
  package_purchased: { icon: Package, color: "bg-purple-500/10 text-purple-500" },
  whatsapp_inquiry: { icon: MessageCircle, color: "bg-teal-500/10 text-teal-600" },
};

export function HQActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const [users, properties, viewings, requests] = await Promise.all([
          supabase.from("profiles").select("id, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("properties").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("viewings").select("id, property_title, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("concierge_requests").select("id, type, full_name, created_at").order("created_at", { ascending: false }).limit(5),
        ]);

        const items: ActivityItem[] = [];

        (users.data ?? []).forEach((u: any) => {
          items.push({
            id: `user-${u.id}`,
            type: "new_user",
            description: "New user registered",
            created_at: u.created_at,
          });
        });

        (properties.data ?? []).forEach((p: any) => {
          items.push({
            id: `prop-${p.id}`,
            type: "new_listing",
            description: `Property listed: ${p.title}`,
            created_at: p.created_at,
          });
        });

        (viewings.data ?? []).forEach((v: any) => {
          items.push({
            id: `viewing-${v.id}`,
            type: "viewing_requested",
            description: `Viewing requested for "${v.property_title}"`,
            created_at: v.created_at,
          });
        });

        (requests.data ?? []).forEach((r: any) => {
          items.push({
            id: `req-${r.id}`,
            type: r.type === "inquiry" ? "whatsapp_inquiry" : "verification_requested",
            description: `${r.full_name}: ${r.type === "inquiry" ? "WhatsApp inquiry received" : "Concierge request"}`,
            created_at: r.created_at,
          });
        });

        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setActivities(items.slice(0, 15));
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" /> Live Activity Feed
      </h3>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activities.map((a) => {
            const meta = activityIcons[a.type] ?? { icon: Activity, color: "bg-secondary text-muted-foreground" };
            const Icon = meta.icon;
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent transition-colors">
                <span className={cn("grid h-8 w-8 place-items-center rounded-lg shrink-0", meta.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
