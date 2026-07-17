import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Viewing {
  id: string;
  property_id: string;
  scheduled_at: string;
  status: "scheduled" | "completed" | "cancelled";
  property?: {
    title: string;
    location: string;
  };
}

export function ScheduledViewings() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchViewings = async () => {
      const { data } = await supabase
        .from("viewings")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_at", { ascending: false });

      if (data) {
        setViewings(data as Viewing[]);
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
  }, [user]);

  const handleCancelViewing = async (viewingId: string) => {
    try {
      await supabase
        .from("viewings")
        .update({ status: "cancelled" })
        .eq("id", viewingId);
      toast.success("Viewing cancelled");
      setViewings(viewings.map(v => v.id === viewingId ? { ...v, status: "cancelled" } : v));
      setSelectedViewing(null);
    } catch (error) {
      toast.error("Failed to cancel viewing");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (viewings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No scheduled viewings yet</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
    completed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-4">
      {viewings.map(viewing => (
        <div
          key={viewing.id}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-soft transition-shadow cursor-pointer"
          onClick={() => setSelectedViewing(viewing)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {viewing.property?.title || "Property"}
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
                {viewing.property?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{viewing.property.location}</span>
                  </div>
                )}
              </div>
            </div>

            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                statusColors[viewing.status]
              )}
            >
              {viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}
            </span>
          </div>
        </div>
      ))}

      {/* Detail Dialog */}
      {selectedViewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl">Viewing Details</h3>
              <button
                onClick={() => setSelectedViewing(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Property</label>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedViewing.property?.title}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Date & Time</label>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedViewing.scheduled_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Location</label>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedViewing.property?.location}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                <span
                  className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1",
                    statusColors[selectedViewing.status]
                  )}
                >
                  {selectedViewing.status.charAt(0).toUpperCase() +
                    selectedViewing.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedViewing(null)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedViewing.status === "scheduled" && (
                <button
                  onClick={() => {
                    handleCancelViewing(selectedViewing.id);
                  }}
                  className="flex-1 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Cancel Viewing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
