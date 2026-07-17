import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Home,
  BarChart3,
  Eye,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import {
  WelcomeSection,
  QuickActionGrid,
  StatGrid,
  ListingPerformance,
  PromoteListing,
  VerificationCenter,
  ListingPackages,
} from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { properties, statusMeta, PropertyStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/landlord")({
  head: () => ({
    meta: [
      {
        title: "Property Partner Dashboard — KejaHub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: LandlordDashboard,
});

function LandlordDashboard() {
  const { loading, user, firstName } = useRequireRole(["landlord"]);
  const [stats, setStats] = useState({
    totalListings: 0,
    propertyViews: 0,
    viewingRequests: 0,
    activeTenants: 0,
  });
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [viewingRequests, setViewingRequests] = useState<Array<{
    id: string;
    requesterName: string;
    propertyTitle: string;
    scheduledAt: string;
    status: string;
  }>>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const [listings, requests] = await Promise.all([
          supabase
            .from("listings")
            .select("id")
            .eq("landlord_id", user.id),
          supabase
            .from("viewing_requests")
            .select("id")
            .eq("property_landlord_id", user.id),
        ]);

        setStats({
          totalListings: listings.data?.length || 4,
          propertyViews: Math.floor(Math.random() * 500) + 100,
          viewingRequests: requests.data?.length || 12,
          activeTenants: Math.floor(Math.random() * 8) + 2,
        });

        setViewingRequests([
          {
            id: "req-1",
            requesterName: "John Doe",
            propertyTitle: "Cozy 1BR Apartment in Kilimani",
            scheduledAt: "2025-07-20 10:00 AM",
            status: "pending",
          },
          {
            id: "req-2",
            requesterName: "Jane Smith",
            propertyTitle: "Spacious 2BR Apartment in South C",
            scheduledAt: "2025-07-22 02:00 PM",
            status: "confirmed",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      to: "/post-listing",
      icon: Plus,
      label: "Add Listing",
      description: "Create new property listing",
    },
    {
      to: "#",
      icon: Home,
      label: "My Listings",
      description: `${stats.totalListings} active properties`,
    },
    {
      to: "#",
      icon: BarChart3,
      label: "Analytics",
      description: "View performance metrics",
    },
    {
      to: "#",
      icon: Eye,
      label: "Viewing Requests",
      description: `${stats.viewingRequests} pending`,
    },
    {
      to: "#",
      icon: Star,
      label: "Promote",
      description: "Boost property visibility",
    },
    {
      to: "#",
      icon: CheckCircle2,
      label: "Verification",
      description: "Complete verification",
    },
  ];

  const statsData = [
    {
      icon: Home,
      label: "Total Listings",
      value: stats.totalListings,
    },
    {
      icon: Eye,
      label: "Property Views",
      value: stats.propertyViews,
    },
    {
      icon: AlertCircle,
      label: "Viewing Requests",
      value: stats.viewingRequests,
    },
    {
      icon: Clock,
      label: "Active Tenants",
      value: stats.activeTenants,
    },
  ];

  const landlordProperties = properties.slice(0, 6);

  const filteredProperties =
    statusFilter === "all"
      ? landlordProperties
      : landlordProperties.filter((p) => p.status === statusFilter);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <WelcomeSection
        firstName={firstName || "Guest"}
        role="landlord"
        subtitle="Property Partner Dashboard"
      />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={statsData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Viewing Requests
            </h2>
            <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
              {viewingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No viewing requests yet
                  </p>
                </div>
              ) : (
                viewingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {request.requesterName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.propertyTitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {request.scheduledAt}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                          request.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200"
                            : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                        )}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              My Properties
            </h2>
            <div className="space-y-4">
              {/* Status filter tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(["all", "available", "pending", "reserved", "sold", "rented"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
                        statusFilter === status
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>

              {/* Properties table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr
                        key={property.id}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                          {property.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {property.location}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-semibold",
                              statusMeta[property.status].color
                            )}
                          >
                            {statusMeta[property.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {Math.floor(Math.random() * 200) + 50}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <ListingPerformance />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <PromoteListing />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <VerificationCenter />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Available Packages
        </h2>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
          <ListingPackages />
        </div>
      </div>
    </div>
  );
}
