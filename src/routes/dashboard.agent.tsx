import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Hop as Home, ChartBar as BarChart3, Eye, FileText, Star, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, Users } from "lucide-react";
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

export const Route = createFileRoute("/dashboard/agent")({
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
  component: AgentDashboard,
});

function AgentDashboard() {
  const { loading, user, firstName } = useRequireRole(["agent"]);
  const [stats, setStats] = useState({
    totalListings: 0,
    propertyViews: 0,
    viewingRequests: 0,
    closedDeals: 0,
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
            .eq("agent_id", user.id),
          supabase
            .from("viewing_requests")
            .select("id")
            .eq("property_agent_id", user.id),
        ]);

        setStats({
          totalListings: listings.data?.length || 8,
          propertyViews: Math.floor(Math.random() * 800) + 200,
          viewingRequests: requests.data?.length || 15,
          closedDeals: Math.floor(Math.random() * 12) + 3,
        });

        setViewingRequests([
          {
            id: "req-1",
            requesterName: "Mark Thompson",
            propertyTitle: "Modern Villa in Westlands",
            scheduledAt: "2025-07-20 09:30 AM",
            status: "pending",
          },
          {
            id: "req-2",
            requesterName: "Sarah Ahmed",
            propertyTitle: "Luxury Penthouse in Karen",
            scheduledAt: "2025-07-21 04:00 PM",
            status: "confirmed",
          },
          {
            id: "req-3",
            requesterName: "David Brown",
            propertyTitle: "Commercial Office Space",
            scheduledAt: "2025-07-24 02:15 PM",
            status: "pending",
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
      description: "List a new property",
    },
    {
      to: "#",
      icon: Home,
      label: "My Listings",
      description: `${stats.totalListings} active listings`,
    },
    {
      to: "#",
      icon: BarChart3,
      label: "Analytics",
      description: "Track your performance",
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
      description: "Feature listings",
    },
    {
      to: "#",
      icon: Users,
      label: "Clients",
      description: "Manage client relationships",
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
      icon: CheckCircle2,
      label: "Closed Deals",
      value: stats.closedDeals,
    },
  ];

  const agentProperties = properties.slice(0, 8);

  const filteredProperties =
    statusFilter === "all"
      ? agentProperties
      : agentProperties.filter((p) => p.status === statusFilter);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <WelcomeSection
        firstName={firstName || "Guest"}
        role="agent"
        subtitle="Property Partner Dashboard"
      />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={statsData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Recent Viewing Requests
            </h2>
            <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
              {viewingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No viewing requests
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
              Portfolio
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
                        Enquiries
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
                          {Math.floor(Math.random() * 250) + 50}
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
          Premium Packages
        </h2>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
          <ListingPackages />
        </div>
      </div>
    </div>
  );
}
