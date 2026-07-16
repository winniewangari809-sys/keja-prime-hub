import { createFileRoute } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, Loader as Loader2, Images, Film, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/media")({
  head: () => ({ meta: [{ title: "Media Control — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQMedia,
});

interface MediaRow {
  id: string;
  property_id: string;
  owner_id: string;
  kind: string;
  category: string;
  public_url: string;
  thumbnail_url: string | null;
  review_status: string;
  review_note: string | null;
  created_at: string;
  property_title?: string;
}

const statusMeta: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-warning/15 text-warning-foreground", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-success/15 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive", icon: XCircle },
  needs_better: { label: "Needs Better", color: "bg-orange-500/15 text-orange-600", icon: AlertCircle },
};

function HQMedia() {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [reviewTarget, setReviewTarget] = useState<MediaRow | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | "needs_better">("approved");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("property_media")
        .select(`
          id, property_id, owner_id, kind, category, public_url, thumbnail_url,
          review_status, review_note, created_at,
          properties!inner(title)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const rows: MediaRow[] = (data || []).map((row: any) => ({
        id: row.id,
        property_id: row.property_id,
        owner_id: row.owner_id,
        kind: row.kind,
        category: row.category,
        public_url: row.public_url,
        thumbnail_url: row.thumbnail_url,
        review_status: row.review_status,
        review_note: row.review_note,
        created_at: row.created_at,
        property_title: row.properties?.title ?? "Unknown",
      }));
      setMedia(rows);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const openReview = (item: MediaRow, action: "approved" | "rejected" | "needs_better") => {
    setReviewTarget(item);
    setReviewAction(action);
    setReviewNote(item.review_note ?? "");
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("property_media")
        .update({
          review_status: reviewAction,
          review_note: reviewNote || null,
          reviewed_by: userData.user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reviewTarget.id);

      if (error) throw error;

      toast.success(`Media ${reviewAction === "approved" ? "approved" : reviewAction === "rejected" ? "rejected" : "flagged for better quality"}`);
      setReviewTarget(null);
      setReviewNote("");
      fetchMedia();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setReviewing(false);
    }
  };

  const deleteMedia = async (item: MediaRow) => {
    if (!confirm("Delete this media? This cannot be undone.")) return;
    try {
      // Extract storage path from public_url
      const pathMatch = item.public_url.match(/\/property-media\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("property-media").remove([pathMatch[1]]);
      }
      await supabase.from("property_media").delete().eq("id", item.id);
      toast.success("Media deleted");
      fetchMedia();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message || "Unknown error"}`);
    }
  };

  const filtered = media.filter((m) => {
    if (filter !== "all" && m.review_status !== filter) return false;
    if (kindFilter !== "all" && m.kind !== kindFilter) return false;
    return true;
  });

  const counts = {
    all: media.length,
    pending: media.filter((m) => m.review_status === "pending").length,
    approved: media.filter((m) => m.review_status === "approved").length,
    rejected: media.filter((m) => m.review_status === "rejected").length,
    needs_better: media.filter((m) => m.review_status === "needs_better").length,
  };

  return (
    <HQPage title="Media Control Center" description="Review, approve, reject, or remove all uploaded photos and videos.">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              filter === key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
            )}
          >
            <p className="text-2xl font-bold tabular-nums">{count}</p>
            <p className="text-xs text-muted-foreground capitalize">{key === "all" ? "All Media" : key.replace("_", " ")}</p>
          </button>
        ))}
      </div>

      {/* Kind filter */}
      <div className="flex gap-2 mb-6">
        {["all", "photo", "video"].map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              kindFilter === k ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
            )}
          >
            {k === "photo" && <Images className="h-3.5 w-3.5" />}
            {k === "video" && <Film className="h-3.5 w-3.5" />}
            {k === "all" ? "All Types" : k === "photo" ? "Photos" : "Videos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState label="No media uploaded yet. Photos and videos from listings will appear here for review." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const StatusIcon = statusMeta[item.review_status]?.icon ?? AlertCircle;
            return (
              <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="relative aspect-video bg-secondary">
                  {item.kind === "video" ? (
                    <img src={item.thumbnail_url ?? item.public_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <img src={item.public_url} alt="" className="h-full w-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", statusMeta[item.review_status]?.color)}>
                      <StatusIcon className="h-2.5 w-2.5" /> {statusMeta[item.review_status]?.label}
                    </span>
                  </div>
                  {item.kind === "video" && (
                    <div className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white">
                      <Film className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground truncate">{item.property_title}</p>
                  <p className="text-sm font-semibold">{item.category}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  {item.review_note && (
                    <p className="mt-1 text-[10px] text-orange-600 bg-orange-50 rounded px-1.5 py-1">
                      Note: {item.review_note}
                    </p>
                  )}
                  <div className="mt-3 flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => openReview(item, "approved")}>
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => openReview(item, "needs_better")}>
                      <AlertCircle className="h-3 w-3" /> Better
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 text-destructive hover:text-destructive" onClick={() => openReview(item, "rejected")}>
                      <XCircle className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-destructive hover:text-destructive" onClick={() => deleteMedia(item)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent>
          <DialogTitle>
            {reviewAction === "approved" && "Approve Media"}
            {reviewAction === "rejected" && "Reject Media"}
            {reviewAction === "needs_better" && "Request Better Photos"}
          </DialogTitle>
          {reviewTarget && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border overflow-hidden">
                {reviewTarget.kind === "video" ? (
                  <img src={reviewTarget.thumbnail_url ?? reviewTarget.public_url} alt="" className="w-full max-h-64 object-cover" />
                ) : (
                  <img src={reviewTarget.public_url} alt="" className="w-full max-h-64 object-cover" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-semibold">{reviewTarget.category}</p>
                <p className="text-muted-foreground text-xs">{reviewTarget.property_title}</p>
              </div>
              {reviewAction !== "approved" && (
                <div>
                  <label className="text-sm font-semibold">Note to owner (optional):</label>
                  <Textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={3}
                    placeholder={reviewAction === "needs_better" ? "e.g. Kitchen photo is too dark. Please retake in daylight." : "e.g. This photo does not match the property."}
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button
              onClick={submitReview}
              disabled={reviewing}
              className={cn(
                reviewAction === "approved" && "bg-success text-white hover:bg-success/90",
                reviewAction === "rejected" && "bg-destructive text-white hover:bg-destructive/90",
                reviewAction === "needs_better" && "bg-orange-500 text-white hover:bg-orange-600",
              )}
            >
              {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HQPage>
  );
}
