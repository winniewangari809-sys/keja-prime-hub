import { createFileRoute, Link } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Loader as Loader2, CircleCheck as CheckCircle2, Circle as XCircle, EyeOff, Trash2, Star, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/listings")({
  head: () => ({ meta: [{ title: "Listings — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQListings,
});

interface PropertyRow {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  property_type: string;
  status: string;
  admin_status: string;
  admin_note: string | null;
  featured: boolean;
  images: any;
  created_at: string;
}

const adminStatusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending Review", color: "bg-warning/15 text-warning-foreground" },
  approved: { label: "Approved", color: "bg-success/15 text-success" },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive" },
  hidden: { label: "Hidden", color: "bg-secondary text-muted-foreground" },
};

function HQListings() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PropertyRow | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, location, price, property_type, status, admin_status, admin_note, featured, images, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setProperties(data ?? []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filtered = properties.filter((p) => {
    if (statusFilter !== "all" && p.admin_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.location?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const updateAdminStatus = async (prop: PropertyRow, status: "approved" | "rejected" | "hidden", note?: string) => {
    setActionLoading(prop.id);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("properties")
        .update({
          admin_status: status,
          admin_note: note ?? null,
          reviewed_by: userData.user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", prop.id);

      if (error) throw error;
      toast.success(`Listing ${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "hidden"}`);
      if (status === "rejected") setRejectTarget(null);
      fetchProperties();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeature = async (prop: PropertyRow) => {
    setActionLoading(prop.id);
    try {
      const until = prop.featured ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("properties")
        .update({ featured: !prop.featured, featured_until: until })
        .eq("id", prop.id);

      if (error) throw error;
      toast.success(prop.featured ? "Unfeatured" : "Featured for 7 days");
      fetchProperties();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteListing = async (prop: PropertyRow) => {
    if (!confirm(`Delete "${prop.title}"? This cannot be undone.`)) return;
    setActionLoading(prop.id);
    try {
      const { error } = await supabase.from("properties").delete().eq("id", prop.id);
      if (error) throw error;
      toast.success("Listing deleted");
      fetchProperties();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all: properties.length,
    pending: properties.filter((p) => p.admin_status === "pending").length,
    approved: properties.filter((p) => p.admin_status === "approved").length,
    rejected: properties.filter((p) => p.admin_status === "rejected").length,
    hidden: properties.filter((p) => p.admin_status === "hidden").length,
  };

  return (
    <HQPage title="Listing Management" description="Approve, reject, hide, feature, or delete any listing on the platform.">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              statusFilter === key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
            )}
          >
            <p className="text-2xl font-bold tabular-nums">{count}</p>
            <p className="text-xs text-muted-foreground capitalize">{key === "all" ? "All Listings" : key}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or location..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState label="No listings found." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Admin Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prop) => {
                const images = (prop.images as string[]) ?? [];
                return (
                  <tr key={prop.id} className={cn("border-t border-border", prop.admin_status === "hidden" && "opacity-60")}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {images[0] && <img src={images[0]} alt="" className="h-10 w-14 rounded object-cover" />}
                        <div className="min-w-0">
                          <p className="font-semibold line-clamp-1">{prop.title}</p>
                          <p className="text-xs text-muted-foreground">{prop.location ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{prop.property_type}</td>
                    <td className="p-4 font-semibold">KSh {prop.price?.toLocaleString() ?? "—"}</td>
                    <td className="p-4">
                      <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", adminStatusMeta[prop.admin_status]?.color)}>
                        {adminStatusMeta[prop.admin_status]?.label ?? prop.admin_status}
                      </span>
                      {prop.admin_note && (
                        <p className="mt-1 text-[10px] text-orange-600 max-w-[200px] truncate" title={prop.admin_note}>
                          Note: {prop.admin_note}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {prop.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning-foreground">
                          <Star className="h-3 w-3 fill-current" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {prop.admin_status !== "approved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-success hover:text-success"
                            onClick={() => updateAdminStatus(prop, "approved")}
                            title="Approve"
                            disabled={actionLoading === prop.id}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {prop.admin_status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => { setRejectTarget(prop); setRejectNote(""); }}
                            title="Reject"
                            disabled={actionLoading === prop.id}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {prop.admin_status !== "hidden" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => updateAdminStatus(prop, "hidden")}
                            title="Hide"
                            disabled={actionLoading === prop.id}
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn("h-8 w-8 p-0", prop.featured ? "text-warning-foreground" : "text-muted-foreground hover:text-warning-foreground")}
                          onClick={() => toggleFeature(prop)}
                          title={prop.featured ? "Unfeature" : "Feature"}
                          disabled={actionLoading === prop.id}
                        >
                          <Star className={cn("h-3.5 w-3.5", prop.featured && "fill-current")} />
                        </Button>
                        <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="View">
                          <Link to="/property/$slug" params={{ slug: prop.id }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => deleteListing(prop)}
                          title="Delete"
                          disabled={actionLoading === prop.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogTitle>Reject Listing</DialogTitle>
          <DialogDescription>
            {rejectTarget?.title} — provide a reason for the owner.
          </DialogDescription>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            placeholder="e.g. Photos don't match the description. Please upload accurate photos."
            className="mt-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => rejectTarget && updateAdminStatus(rejectTarget, "rejected", rejectNote)}
              disabled={actionLoading === rejectTarget?.id}
            >
              {actionLoading === rejectTarget?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HQPage>
  );
}
