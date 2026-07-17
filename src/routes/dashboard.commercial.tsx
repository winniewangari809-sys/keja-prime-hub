import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, Plus, Eye, ChartBar as BarChart3, Calendar, Star, CircleCheck as CheckCircle2 } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import {
  WelcomeSection,
  QuickActionGrid,
  StatGrid,
  PromoteListing,
  VerificationCenter,
  ListingPackages,
  HQActivityFeed,
} from "@/components/site";
import { Button } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/commercial")({
  head: () => ({
    meta: [
      {
        title: "Commercial Owner Dashboard — KejaHub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: CommercialDashboard,
});

function CommercialDashboard() {
  const { loading, user, firstName } = useRequireRole(["commercial"]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    interestRate: 0,
  });

  useEffect(() => {
    if (!loading && user) {
      setStats({
        totalProperties: Math.floor(Math.random() * 12) + 1,
        totalViews: Math.floor(Math.random() * 8000) + 1000,
        totalInquiries: Math.floor(Math.random() * 80) + 10,
        interestRate: Math.floor(Math.random() * 30) + 60,
      });
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <WelcomeSection
        title={`Welcome back, ${firstName}!`}
        subtitle="Property Partner Dashboard"
        eyebrow="Commercial Owner"
      />

      <div className="container-app py-8 space-y-8">
        {/* Quick Actions */}
        <QuickActionGrid
          actions={[
            {
              label: "Add Commercial",
              icon: Plus,
              color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
              href: "/post-listing?type=commercial",
            },
            {
              label: "My Properties",
              icon: Building2,
              color: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
              href: "/dashboard/commercial#properties",
            },
            {
              label: "Analytics",
              icon: BarChart3,
              color: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
              href: "/dashboard/commercial#analytics",
            },
            {
              label: "Inquiries",
              icon: Calendar,
              color: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
              href: "/dashboard/commercial#inquiries",
            },
            {
              label: "Promote",
              icon: Star,
              color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
              href: "/dashboard/commercial#promote",
            },
            {
              label: "Verification",
              icon: CheckCircle2,
              color: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
              href: "/dashboard/commercial#verification",
            },
          ]}
        />

        {/* Statistics */}
        <StatGrid
          stats={[
            {
              label: "Total Properties",
              value: stats.totalProperties.toString(),
              trend: "+1 this month",
              icon: Building2,
              color: "blue",
            },
            {
              label: "Total Views",
              value: stats.totalViews.toLocaleString(),
              trend: "+18% this month",
              icon: Eye,
              color: "green",
            },
            {
              label: "Total Inquiries",
              value: stats.totalInquiries.toString(),
              trend: "+8 this month",
              icon: Calendar,
              color: "purple",
            },
            {
              label: "Interest Rate",
              value: `${stats.interestRate}%`,
              trend: "Target: 80%",
              icon: BarChart3,
              color: "orange",
            },
          ]}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Promote Listing */}
            <div id="promote">
              <PromoteListing />
            </div>

            {/* Activity Feed */}
            <div>
              <h3 className="font-display font-bold text-2xl mb-6">Recent Activity</h3>
              <HQActivityFeed />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Verification */}
            <div id="verification">
              <VerificationCenter />
            </div>

            {/* Packages */}
            <ListingPackages />
          </div>
        </div>

        {/* Recent Inquiries */}
        <div id="inquiries" className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <h3 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Recent Inquiries
          </h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Business Inquiry {i + 1}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Interest in your property
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
