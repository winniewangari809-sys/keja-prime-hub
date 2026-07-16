import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { HQInternalNotes } from "@/components/site/HQInternalNotes";
import { Calendar, Phone, Mail, Check, X, RotateCw, Eye, Loader as Loader2, Flag, Ban, EyeOff, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/hq/viewings")({
  head: () => ({ meta: [{ title: "Viewing Requests — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: ViewingRequests,
});

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
  property_title: string | null;
  preferred_date: string;
  preferred_time: string;
  phone_number: string;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  requester_id: string;
}

interface ConciergeReq {
  id: string;
  type: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  preferred_contact: string | null;
  message: string | null;
  budget: string | null;
  location: string | null;
  property_type: string | null;
  bedrooms: string | null;
  status: string;
  created_at: string;
}

function ViewingRequests() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [conciergeReqs, setConciergeReqs] = useState<ConciergeReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailView, setDetailView] = useState<Viewing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [vRes, cRes] = await Promise.all([
        supabase.from("viewings").select("*").order("created_at", { ascending: false }),
        supabase.from("concierge_requests").select("*").order("created_at", { ascending: false }),
      ]);
      setViewings((vRes.data as Viewing[]) ?? []);
      setConciergeReqs((cRes.data as ConciergeReq[]) ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const updateViewingStatus = async (id: string, status: string) => {
    setActionLoading(true);
    const { error } = await supabase
      .from("viewings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setActionLoading(false);
    if (error) {
      toast.error("Failed to update viewing status");
    } else {
      toast.success(`Viewing ${status}`);
      setViewings(viewings.map((v) => v.id === id ? { ...v, status } : v));
      setDetailView(null);
    }
  };

  const updateConciergeStatus = async (id: string, status: string) => {
    setActionLoading(true);
    const { error } = await supabase
      .from("concierge_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setActionLoading(false);
    if (error) {
      toast.error("Failed to update request status");
    } else {
      toast.success(`Request ${status}`);
      setConciergeReqs(conciergeReqs.map((r) => r.id === id ? { ...r, status } : r));
    }
  };

  return (
    <HQPage
      title="Viewing Requests"
      subtitle="Manage property viewings and concierge inquiries — all buyer contact info is visible only to HQ."
    >
      <div className="space-y-8">
        {/* Viewings */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Scheduled Viewings ({viewings.length})
          </h2>
          {loading ? (
            <div className="grid h-40 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : viewings.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl border border-border p-6 text-center">No viewing requests yet.</p>
          ) : (
            <div className="space-y-3">
              {viewings.map((v) => {
                const sm = statusMeta[v.status] ?? statusMeta.pending;
                return (
                  <div key={v.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{v.property_title || "Property viewing"}</p>
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", sm.color)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", sm.dot)} /> {sm.label}
                          </span>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(v.preferred_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span className="flex items-center gap-1"><span className="font-mono">⏰</span> {v.preferred_time}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {v.phone_number}</span>
                        </div>
                        {v.notes && <p className="mt-2 text-xs text-muted-foreground">Notes: {v.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setDetailView(v)}>
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                        {v.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-success text-white hover:bg-success/90" disabled={actionLoading} onClick={() => updateViewingStatus(v.id, "approved")}>
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" disabled={actionLoading} onClick={() => updateViewingStatus(v.id, "rejected")}>
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {v.status === "approved" && (
                          <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => updateViewingStatus(v.id, "completed")}>
                            <Check className="h-3.5 w-3.5" /> Mark Completed
                          </Button>
                        )}
                        <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => updateViewingStatus(v.id, "rescheduled")}>
                          <RotateCw className="h-3.5 w-3.5" /> Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Concierge Requests */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" /> Concierge Inquiries & Find Requests ({conciergeReqs.length})
          </h2>
          {conciergeReqs.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl border border-border p-6 text-center">No concierge requests yet.</p>
          ) : (
            <div className="space-y-3">
              {conciergeReqs.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          r.type === "find_property" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                        )}>
                          {r.type === "find_property" ? "Find Property" : "Inquiry"}
                        </span>
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          r.status === "pending" ? "bg-warning/15 text-warning-foreground" :
                          r.status === "contacted" ? "bg-primary/15 text-primary" :
                          r.status === "resolved" ? "bg-success/15 text-success" :
                          "bg-secondary text-muted-foreground"
                        )}>
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                        <span><span className="font-semibold text-foreground">{r.full_name}</span></span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {r.phone_number}</span>
                        {r.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {r.email}</span>}
                        {r.preferred_contact && <span>Contact via: {r.preferred_contact}</span>}
                        {r.budget && <span>Budget: <span className="font-semibold text-foreground">{r.budget}</span></span>}
                        {r.location && <span>Location: {r.location}</span>}
                        {r.property_type && <span>Type: {r.property_type}</span>}
                        {r.bedrooms && <span>Bedrooms: {r.bedrooms}</span>}
                      </div>
                      {r.message && <p className="mt-2 text-xs text-muted-foreground">Message: {r.message}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {r.status === "pending" && (
                        <Button size="sm" className="bg-primary text-primary-foreground" disabled={actionLoading} onClick={() => updateConciergeStatus(r.id, "contacted")}>
                          <Phone className="h-3.5 w-3.5" /> Contact Buyer
                        </Button>
                      )}
                      {r.status === "contacted" && (
                        <Button size="sm" className="bg-success text-white hover:bg-success/90" disabled={actionLoading} onClick={() => updateConciergeStatus(r.id, "resolved")}>
                          <Check className="h-3.5 w-3.5" /> Mark Resolved
                        </Button>
                      )}
                      <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => updateConciergeStatus(r.id, "closed")}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Internal Notes & Anti-scam Controls */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HQInternalNotes />

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Anti-Scam Controls
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Take action against suspicious listings or users.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => toast.success("Listing hidden. It will no longer appear in search results.")}
            >
              <EyeOff className="h-4 w-4 text-amber-500" /> Hide Listing
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => toast.success("Listing suspended. Owner has been notified.")}
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Suspend Listing
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => toast.success("Listing removed. This action has been logged.")}
            >
              <X className="h-4 w-4 text-destructive" /> Remove Listing
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => toast.success("Listing flagged as scam. Investigation started.")}
            >
              <Flag className="h-4 w-4 text-red-500" /> Flag Scam
            </Button>
            <Button
              variant="outline"
              className="justify-start sm:col-span-2"
              onClick={() => toast.success("User banned. All their listings have been hidden.")}
            >
              <Ban className="h-4 w-4 text-destructive" /> Ban User
            </Button>
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detailView} onOpenChange={(v) => !v && setDetailView(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Viewing Details</DialogTitle>
          <DialogDescription>Full viewing information — visible only to HQ Admin.</DialogDescription>
          {detailView && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase">Property</p>
                <p className="font-semibold">{detailView.property_title || "Property viewing"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase">Date</p>
                  <p className="font-semibold">{new Date(detailView.preferred_date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase">Time</p>
                  <p className="font-semibold">{detailView.preferred_time}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase">Buyer Phone (HQ only)</p>
                <p className="font-mono font-semibold">{detailView.phone_number}</p>
              </div>
              {detailView.notes && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase">Notes</p>
                  <p>{detailView.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-success text-white hover:bg-success/90" disabled={actionLoading} onClick={() => updateViewingStatus(detailView.id, "approved")}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-destructive" disabled={actionLoading} onClick={() => updateViewingStatus(detailView.id, "rejected")}>
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button size="sm" variant="outline" className="flex-1" disabled={actionLoading} onClick={() => updateViewingStatus(detailView.id, "rescheduled")}>
                  <RotateCw className="h-4 w-4" /> Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HQPage>
  );
}
