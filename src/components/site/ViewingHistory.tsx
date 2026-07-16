import { useEffect, useState } from "react";
import { History, Calendar, Clock, Loader as Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const statusMeta: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive" },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive" },
  approved: { label: "Approved", color: "bg-success/15 text-success" },
  pending: { label: "Pending", color: "bg-warning/15 text-warning-foreground" },
  rescheduled: { label: "Rescheduled", color: "bg-primary/15 text-primary" },
};

interface ViewingRecord {
  id: string;
  property_title: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

export function ViewingHistory({ userId }: { userId?: string }) {
  const [history, setHistory] = useState<ViewingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    async function fetchHistory() {
      const { data } = await supabase
        .from("viewings")
        .select("id, property_title, preferred_date, preferred_time, status, created_at")
        .eq("requester_id", userId)
        .in("status", ["completed", "cancelled", "rejected"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setHistory(data as ViewingRecord[]);
      setLoading(false);
    }
    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" /> Viewing History
        </h3>
        <div className="grid h-20 place-items-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-2">
          <History className="h-5 w-5 text-primary" /> Viewing History
        </h3>
        <p className="text-sm text-muted-foreground">No viewing history yet. Completed and cancelled viewings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" /> Viewing History
      </h3>
      <div className="space-y-2">
        {history.map((v) => {
          const sm = statusMeta[v.status] ?? statusMeta.pending;
          return (
            <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-muted-foreground shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{v.property_title || "Property viewing"}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(v.preferred_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {v.preferred_time}
                  </span>
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shrink-0", sm.color)}>
                {sm.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
