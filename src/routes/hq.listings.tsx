import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Hop as Home, Search, CircleCheck as CheckCircle2, Circle as XCircle, Eye, Star, MoveVertical as MoreVertical } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/listings")({
  head: () => ({
    meta: [
      {
        title: "Listing Management — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: ListingManagement,
});

interface ListingRecord {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  admin_status: string;
  created_at: string;
  owner_id: string;
}

function ListingManagement() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAdminStatus, setFilterAdminStatus] = useState("all");
  const [selectedListing, setSelectedListing] = useState<ListingRecord | null>(
    null
  );

  useEffect(() => {
    if (!authLoading) {
      fetchListings();
    }
  }, [authLoading]);

  const fetchListings = async () => {
    try {
      const { data: listingData } = await supabase
        .from("listings")
        .select(
          "id, title, location, price, status, admin_status, created_at, owner_id"
        )
        .order("created_at", { ascending: false });

      if (listingData) {
        setListings(
          listingData.map((l: any) => ({
            id: l.id,
            title: l.title,
            location: l.location,
            price: l.price,
            status: l.status || "active",
            admin_status: l.admin_status || "pending",
            created_at: l.created_at,
            owner_id: l.owner_id,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (
    listingId: string,
    adminStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ admin_status: adminStatus })
        .eq("id", listingId);

      if (error) throw error;

      setListings(
        listings.map((l) =>
          l.id === listingId ? { ...l, admin_status: adminStatus } : l
        )
      );
      toast.success("Listing updated");
      setSelectedListing(null);
    } catch (error) {
      console.error("Failed to update listing:", error);
      toast.error("Failed to update listing");
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || listing.status === filterStatus;
    const matchesAdminStatus =
      filterAdminStatus === "all" || listing.admin_status === filterAdminStatus;
    return matchesSearch && matchesStatus && matchesAdminStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      case "suspended":
        return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Listing Management" description="Review and manage property listings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listings...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Listing Management" description="Review and manage property listings">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAdminStatus} onValueChange={setFilterAdminStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Review Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Listings</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {listings.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {listings.filter((l) => l.admin_status === "approved").length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {listings.filter((l) => l.admin_status === "pending").length}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {listings.filter((l) => l.admin_status === "suspended").length}
            </p>
          </div>
        </div>

        {/* Listings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Title
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Location
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Price
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Review
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold max-w-xs truncate">
                    {listing.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {listing.location}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                    KES {listing.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        listing.status === "active"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      )}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(listing.admin_status))}>
                      {listing.admin_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Dialog
                      open={selectedListing?.id === listing.id}
                      onOpenChange={(open) =>
                        setSelectedListing(open ? listing : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Listing Actions</DialogTitle>
                          <DialogDescription>
                            {listing.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button
                            onClick={() =>
                              updateListingStatus(listing.id, "approved")
                            }
                            className="w-full"
                            variant="default"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() =>
                              updateListingStatus(listing.id, "rejected")
                            }
                            className="w-full"
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() =>
                              updateListingStatus(listing.id, "suspended")
                            }
                            className="w-full"
                            variant="outline"
                          >
                            Suspend
                          </Button>
                          <Button
                            onClick={() =>
                              updateListingStatus(listing.id, "featured")
                            }
                            className="w-full"
                            variant="outline"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Feature
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No listings found</p>
          </div>
        )}
      </div>
    </HQPage>
  );
}
