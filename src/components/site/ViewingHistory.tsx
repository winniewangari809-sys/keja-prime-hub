import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, MapPin, Clock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewingRecord {
  id: string;
  user_id: string;
  property_id: string;
  scheduled_at: string;
  status: "scheduled" | "completed" | "cancelled";
  properties?: {
    title: string;
    location: string;
  };
}

export function ViewingHistory() {
  const [viewings, setViewings] = useState<ViewingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchViewings = async () => {
      let query = supabase
        .from("viewings")
        .select("*, properties(title, location)")
        .eq("user_id", user.id)
        .in("status", ["completed", "cancelled"])
        .order("scheduled_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data } = await query;

      if (data) {
        setViewings(data as ViewingRecord[]);
      }
      setLoading(false);
    };

    fetchViewings();

    const subscription = supabase
      .channel("viewings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "viewings",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchViewings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, filter]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (viewings.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          {filter === "all"
            ? "No viewing history yet"
            : `No ${filter} viewings`}
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    completed: "bg-success/10 text-success border-success/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "completed", "cancelled"] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold transition-colors text-sm",
              filter === status
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {status === "all" ? "All Viewings" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Viewing List */}
      <div className="space-y-3">
        {viewings.map(viewing => (
          <div
            key={viewing.id}
            className={cn(
              "p-4 rounded-lg border transition-all hover:shadow-soft",
              statusColors[viewing.status]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {viewing.properties?.title || "Property"}
                </h3>

                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{viewing.properties?.location || "Location"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(viewing.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(viewing.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {viewing.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
