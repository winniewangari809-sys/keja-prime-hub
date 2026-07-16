import { createFileRoute, Link } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { Button } from "@/components/ui/button";
import { Star, Loader as Loader2, Pin, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/featured")({
  head: () => ({ meta: [{ title: "Featured Listings — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQFeatured,
});

interface PropertyRow {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  property_type: string;
  featured: boolean;
  featured_until: string | null;
  admin_status: string;
  images: any;
}

function HQFeatured() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuring, setFeaturing] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, location, price, property_type, featured, featured_until, admin_status, images")
        .order("created_at", { ascending: false })
        .limit(100);

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

  const toggleFeature = async (prop: PropertyRow, days: number = 7) => {
    setFeaturing(prop.id);
    try {
      const until = new Date();
      until.setDate(until.getDate() + days);
      const { error } = await supabase
        .from("properties")
        .update({
          featured: !prop.featured,
          featured_until: !prop.featured ? until.toISOString() : null,
        })
        .eq("id", prop.id);

      if (error) throw error;
      toast.success(prop.featured ? "Removed from featured" : `Featured for ${days} days`);
      fetchProperties();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setFeaturing(null);
    }
  };

  const pinToHomepage = async (prop: PropertyRow) => {
    setFeaturing(prop.id);
    try {
      // Pin = feature with 30 days
      const until = new Date();
      until.setDate(until.getDate() + 30);
      const { error } = await supabase
        .from("properties")
        .update({
          featured: true,
          featured_until: until.toISOString(),
        })
        .eq("id", prop.id);

      if (error) throw error;
      toast.success("Pinned to homepage for 30 days");
      fetchProperties();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setFeaturing(null);
    }
  };

  const featured = properties.filter((p) => p.featured);
  const available = properties.filter((p) => !p.featured && p.admin_status !== "hidden" && p.admin_status !== "rejected");

  return (
    <HQPage title="Featured Listings" description="Promote, feature, and pin listings to the homepage.">
      {/* Featured section */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-warning fill-warning" />
          Currently Featured ({featured.length})
        </h2>
        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No featured listings yet. Promote listings below to pin them to the homepage.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((prop) => {
              const images = (prop.images as string[]) ?? [];
              const until = prop.featured_until ? new Date(prop.featured_until) : null;
              const daysLeft = until ? Math.ceil((until.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
              return (
                <div key={prop.id} className="rounded-xl border-2 border-warning/40 bg-warning/5 p-4">
                  <div className="flex items-start gap-3">
                    {images[0] && <img src={images[0]} alt="" className="h-16 w-20 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{prop.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{prop.location ?? "—"}</p>
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        KSh {prop.price?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                  </div>
                  {daysLeft !== null && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={featuring === prop.id}
                      onClick={() => toggleFeature(prop)}
                    >
                      {featuring === prop.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Unfeature"}
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                      <Link to="/property/$slug" params={{ slug: prop.id }}>View</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available to feature */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4">
          Available to Feature ({available.length})
        </h2>
        {loading ? (
          <div className="grid min-h-[30vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : available.length === 0 ? (
          <EmptyState label="No approved listings available to feature." />
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {available.map((prop) => {
                  const images = (prop.images as string[]) ?? [];
                  return (
                    <tr key={prop.id} className="border-t border-border">
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
                        <span className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold capitalize",
                          prop.admin_status === "approved" ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"
                        )}>
                          {prop.admin_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={featuring === prop.id}
                            onClick={() => toggleFeature(prop, 7)}
                          >
                            {featuring === prop.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Star className="h-3 w-3" /> Feature 7d</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            disabled={featuring === prop.id}
                            onClick={() => pinToHomepage(prop)}
                          >
                            <Pin className="h-3 w-3" /> Pin 30d
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
      </div>
    </HQPage>
  );
}
