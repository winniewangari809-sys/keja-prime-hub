import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, User, Hop as Home, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "user" | "property" | "viewing" | "concierge_request";
  title: string;
  description: string;
  timestamp: string;
  icon: typeof User;
}

export function HQActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      // Fetch recent data from multiple tables
      const [usersData, propertiesData, viewingsData, conciergeData] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("viewings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("concierge_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const activityItems: ActivityItem[] = [];

      // Add user activities
      if (usersData.data) {
        usersData.data.forEach((user: any) => {
          activityItems.push({
            id: `user-${user.id}`,
            type: "user",
            title: "New user registered",
            description: `${user.full_name || user.first_name || "User"} joined KejaHub`,
            timestamp: user.created_at,
            icon: User,
          });
        });
      }

      // Add property activities
      if (propertiesData.data) {
        propertiesData.data.forEach((prop: any) => {
          activityItems.push({
            id: `prop-${prop.id}`,
            type: "property",
            title: "Property listed",
            description: prop.title,
            timestamp: prop.created_at,
            icon: Home,
          });
        });
      }

      // Add viewing activities
      if (viewingsData.data) {
        viewingsData.data.forEach((viewing: any) => {
          activityItems.push({
            id: `viewing-${viewing.id}`,
            type: "viewing",
            title: "Viewing scheduled",
            description: `Viewing scheduled for ${new Date(viewing.scheduled_at).toLocaleDateString()}`,
            timestamp: viewing.created_at,
            icon: Calendar,
          });
        });
      }

      // Add concierge activities
      if (conciergeData.data) {
        conciergeData.data.forEach((concierge: any) => {
          activityItems.push({
            id: `concierge-${concierge.id}`,
            type: "concierge_request",
            title: "Concierge request",
            description: `${concierge.request_type} request received`,
            timestamp: concierge.created_at,
            icon: MessageSquare,
          });
        });
      }

      // Sort by timestamp
      activityItems.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activityItems.slice(0, 15));
      setLoading(false);
    };

    fetchActivities();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("admin_activities")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchActivities();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => {
        fetchActivities();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "viewings" }, () => {
        fetchActivities();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "concierge_requests" }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    user: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    property: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    viewing: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    concierge_request: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-primary" />
        <h2 className="font-display font-bold text-2xl">Activity Feed</h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    typeColors[activity.type]
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                    typeColors[activity.type]
                  )}>
                    {activity.type.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
