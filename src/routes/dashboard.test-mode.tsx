import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingCart, Hop as Home, Users, Building2, Zap } from "lucide-react";
import { WelcomeSection, RoleBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/test-mode")({
  head: () => ({
    meta: [
      {
        title: "Test Mode — Dashboard Preview",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: TestModeDashboard,
});

function TestModeDashboard() {
  const roles: Array<{
    role: AppRole;
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<any>;
  }> = [
    {
      role: "buyer",
      label: "Buyer Dashboard",
      description: "Browse and save properties for purchase",
      href: "/dashboard/buyer",
      icon: ShoppingCart,
    },
    {
      role: "tenant",
      label: "Tenant Dashboard",
      description: "Find rental properties and schedule viewings",
      href: "/dashboard/tenant",
      icon: Home,
    },
    {
      role: "landlord",
      label: "Landlord Dashboard",
      description: "Manage rental properties and tenants",
      href: "/dashboard/landlord",
      icon: Building2,
    },
    {
      role: "seller",
      label: "Seller Dashboard",
      description: "List properties for sale",
      href: "/dashboard/seller",
      icon: TrendingUp,
    },
    {
      role: "agent",
      label: "Agent Dashboard",
      description: "Manage client properties and viewings",
      href: "/dashboard/agent",
      icon: Users,
    },
    {
      role: "hq",
      label: "HQ Command Center",
      description: "Platform administration and analytics",
      href: "/dashboard/admin",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Test Mode
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Preview different role dashboards. Select a role to see how the dashboard appears
          for that user type.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.role}
              to={item.href}
              className="group p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-elegant transition-all duration-200 bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <RoleBadge role={item.role} />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">
                {item.label}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                <span>View Dashboard</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          Note: Test Mode
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          This page allows you to preview different role dashboards. In production, users
          will only see their own role's dashboard. You need to be logged in with the
          appropriate role to access each dashboard.
        </p>
      </div>

      <div>
        <Link to="/dashboard" className="inline-block">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

const TrendingUp = ({ className }: { className?: string }) => (
  <svg
    className={className || "w-5 h-5"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);
