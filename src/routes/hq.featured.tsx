import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star, Calendar, Trash2 } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button, Input } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/featured")({
  head: () => ({
    meta: [
      {
        title: "Featured Listings — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: FeaturedListings,
});

interface FeaturedListing {
  id: string;
  title: string;
  location: string;
  price: number;
  featured_until: string;
  created_at: string;
}

function FeaturedListings() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [featured, setFeatured] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchFeatured();
    }
  }, [authLoading]);

  const fetchFeatured = async () => {
    try {
      const { data } = await supabase
        .from("listings")
        .select("id, title, location, price, featured_until, created_at")
        .eq("admin_status", "featured")
        .order("featured_until", { ascending: true });

      if (data) {
        setFeatured(
          data.map((l: any) => ({
            id: l.id,
            title: l.title,
            location: l.location,
            price: l.price,
            featured_until: l.featured_until,
            created_at: l.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch featured listings:", error);
      toast.error("Failed to load featured listings");
    } finally {
      setLoading(false);
    }
  };

  const updateFeaturedUntil = async (listingId: string, newDate: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ featured_until: newDate })
        .eq("id", listingId);

      if (error) throw error;

      setFeatured(
        featured.map((l) =>
          l.id === listingId ? { ...l, featured_until: newDate } : l
        )
      );
      toast.success("Featured date updated");
    } catch (error) {
      console.error("Failed to update featured date:", error);
      toast.error("Failed to update featured date");
    }
  };

  const removeFeatured = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ admin_status: "approved" })
        .eq("id", listingId);

      if (error) throw error;

      setFeatured(featured.filter((l) => l.id !== listingId));
      toast.success("Removed from featured");
    } catch (error) {
      console.error("Failed to remove featured:", error);
      toast.error("Failed to remove featured");
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Featured Listings" description="Manage featured property listings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Featured Listings" description="Manage featured property listings">
      <div className="space-y-6">
        {/* Stats */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Currently Featured
              </h3>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {featured.length} listings
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Featured listings get premium visibility and appear at the top of search results
              </p>
            </div>
          </div>
        </div>

        {/* Featured Listings */}
        <div className="space-y-4">
          {featured.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No featured listings</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Featured listings will appear here
              </p>
            </div>
          ) : (
            featured.map((listing) => {
              const daysRemaining = Math.ceil(
                (new Date(listing.featured_until).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={listing.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-soft transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {listing.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {listing.location}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            KES {listing.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Featured Until
                        </p>
                        <input
                          type="date"
                          value={listing.featured_until.split("T")[0]}
                          onChange={(e) =>
                            updateFeaturedUntil(listing.id, e.target.value)
                          }
                          className="px-2 py-1 border border-amber-300 dark:border-amber-700 rounded bg-white dark:bg-gray-900 text-sm"
                        />
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                          {daysRemaining > 0
                            ? `${daysRemaining} days remaining`
                            : "Expired"}
                        </p>
                      </div>

                      <Button
                        onClick={() => removeFeatured(listing.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </HQPage>
  );
}
