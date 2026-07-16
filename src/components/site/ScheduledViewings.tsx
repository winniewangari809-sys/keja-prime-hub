import { Calendar, Clock, Check, X, RotateCw, Eye, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusMeta: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Pending", color: "bg-warning/15 text-warning-foreground", dot: "bg-warning" },
  approved: { label: "Approved", color: "bg-success/15 text-success", dot: "bg-success" },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
  rescheduled: { label: "Rescheduled", color: "bg-primary/15 text-primary", dot: "bg-primary" },
  completed: { label: "Completed", color: "bg-secondary text-muted-foreground", dot: "bg-muted-foreground" },
  cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
};

interface Viewing {
  id: string;
  property_title?: string;
  property_id?: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  notes?: string;
  created_at: string;
}

export function ScheduledViewings({ viewings, viewerRole }: {
  viewings: Viewing[];
  viewerRole: "buyer" | "seller" | "admin";
}) {
  const [detailView, setDetailView] = useState<Viewing | null>(null);
  const [loading, setLoading] = useState(false);

  const cancelViewing = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("viewings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id);
    setLoading(false);
    if (error) {
      toast.error("Failed to cancel viewing");
    } else {
      toast.success("Viewing cancelled");
      setDetailView(null);
      window.location.reload();
    }
  };

  if (viewings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-primary" /> Scheduled Viewings
        </h3>
        <p className="text-sm text-muted-foreground">No viewings scheduled yet. Browse properties and schedule a viewing to see it here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" /> Scheduled Viewings
      </h3>
      <div className="space-y-3">
        {viewings.map((v) => {
          const sm = statusMeta[v.status] ?? statusMeta.pending;
          return (
            <div key={v.id} className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-accent transition-colors">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{v.property_title || "Property viewing"}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
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
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", sm.color)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", sm.dot)} />
                  {sm.label}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailView(v)}
                >
                  <Eye className="h-3.5 w-3.5" /> Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detailView} onOpenChange={(v) => !v && setDetailView(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Viewing Details</DialogTitle>
          <DialogDescription>Information about your scheduled viewing.</DialogDescription>
          {detailView && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Property</p>
                  <p className="font-semibold">{detailView.property_title || "Property viewing"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Date</p>
                    <p className="font-semibold">{new Date(detailView.preferred_date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Time</p>
                    <p className="font-semibold">{detailView.preferred_time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <span className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", (statusMeta[detailView.status] ?? statusMeta.pending).color)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", (statusMeta[detailView.status] ?? statusMeta.pending).dot)} />
                    {(statusMeta[detailView.status] ?? statusMeta.pending).label}
                  </span>
                </div>
                {detailView.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Notes</p>
                    <p className="text-sm">{detailView.notes}</p>
                  </div>
                )}
              </div>

              {/* Buyer contact info is hidden from seller */}
              {viewerRole === "buyer" && (
                <p className="text-xs text-muted-foreground">
                  Your contact information is shared only with KejaHub HQ Admin — not with the property owner.
                </p>
              )}

              {/* Seller only sees: "A viewing request has been submitted" */}
              {viewerRole === "seller" && (
                <p className="rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                  A viewing request has been submitted. KejaHub HQ will coordinate the details.
                </p>
              )}

              <div className="flex gap-2">
                {viewerRole === "buyer" && (detailView.status === "pending" || detailView.status === "approved") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    disabled={loading}
                    onClick={() => cancelViewing(detailView.id)}
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
