import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Hop as Home, Heart, MessageSquare, Building2, Store, Eye, Clock, Bell, Wifi } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import {
  WelcomeSection,
  QuickActionGrid,
  StatGrid,
  ScheduledViewings,
  BuyerStatusTracker,
  SavedProperties,
  ViewingHistory,
  WhatsAppButton,
  PropertyCard,
} from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { properties } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/tenant")({
  head: () => ({
    meta: [
      {
        title: "Tenant Dashboard — KejaHub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: TenantDashboard,
});

function TenantDashboard() {
  const { loading, user, firstName } = useRequireRole(["tenant"]);
  const [stats, setStats] = useState({
    savedProperties: 0,
    activeRequests: 0,
    propertiesViewed: 0,
    scheduledViewings: 0,
  });
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const [saved, viewings] = await Promise.all([
          supabase
            .from("property_saves")
            .select("id")
            .eq("user_id", user.id),
          supabase
            .from("viewings")
            .select("id")
            .eq("requester_id", user.id)
            .eq("status", "scheduled"),
        ]);

        setStats({
          savedProperties: saved.data?.length || 0,
          activeRequests: 0,
          propertiesViewed: Math.floor(Math.random() * 15) + 3,
          scheduledViewings: viewings.data?.length || 0,
        });
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
      to: "/rentals",
      icon: Home,
      label: "Find Rentals",
      description: "Browse rental properties",
    },
    {
      to: "/airbnbs",
      icon: Building2,
      label: "Find Airbnb",
      description: "Browse short-term rentals",
    },
    {
      to: "#",
      icon: Heart,
      label: "Saved Properties",
      description: `${stats.savedProperties} properties saved`,
    },
    {
      to: "#",
      icon: MessageSquare,
      label: "Messages",
      description: "View your messages",
    },
    {
      to: "/commercial-property",
      icon: Store,
      label: "Find Commercial",
      description: "Browse commercial spaces",
    },
    {
      to: "#",
      icon: Wifi,
      label: "My Rentals",
      description: "View current rentals",
    },
  ];

  const statsData = [
    {
      icon: Heart,
      label: "Saved Properties",
      value: stats.savedProperties,
    },
    {
      icon: Home,
      label: "Active Requests",
      value: stats.activeRequests,
    },
    {
      icon: Eye,
      label: "Properties Viewed",
      value: stats.propertiesViewed,
    },
    {
      icon: Clock,
      label: "Scheduled Viewings",
      value: stats.scheduledViewings,
    },
  ];

  const rentalProperties = properties
    .filter((p) => p.category === "rental" && p.featured && p.status === "available")
    .slice(0, 4);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <WelcomeSection
        firstName={firstName || "Guest"}
        role="tenant"
        subtitle="Find your perfect rental home"
      />

      <DashboardSearchBar />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={statsData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Scheduled Viewings
            </h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
              <ScheduledViewings />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Recommended Rentals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentalProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <BuyerStatusTracker />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No new notifications
                </p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      notif.read
                        ? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        : "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                    )}
                  >
                    {notif.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Saved Properties
        </h2>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
          <SavedProperties />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Viewing History
        </h2>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
          <ViewingHistory />
        </div>
      </div>

      <WhatsAppButton />
    </div>
  );
}

function DashboardSearchBar() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search rentals by location, type, or price..."
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
