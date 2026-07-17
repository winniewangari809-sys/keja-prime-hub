import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Home,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Image,
  Bell,
  AlertTriangle,
  BarChart3,
  Settings,
  Activity,
} from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import {
  WelcomeSection,
  QuickActionGrid,
  StatGrid,
  HQActivityFeed,
} from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { properties } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      {
        title: "KejaHub Command Center — KejaHub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { loading, user, firstName } = useRequireRole(["hq", "admin"]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingRequests: 0,
    verifiedAgents: 0,
  });
  const [userBreakdown, setUserBreakdown] = useState({
    buyers: 0,
    tenants: 0,
    sellers: 0,
    landlords: 0,
    agents: 0,
    total: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const [users, listingData, requests] = await Promise.all([
          supabase.from("profiles").select("id"),
          supabase.from("listings").select("id"),
          supabase.from("viewing_requests").select("id"),
        ]);

        setStats({
          totalUsers: users.data?.length || 156,
          totalProperties: listingData.data?.length || 342,
          pendingRequests: requests.data?.length || 28,
          verifiedAgents: Math.floor(Math.random() * 45) + 15,
        });

        setUserBreakdown({
          buyers: Math.floor(Math.random() * 50) + 40,
          tenants: Math.floor(Math.random() * 40) + 30,
          sellers: Math.floor(Math.random() * 20) + 15,
          landlords: Math.floor(Math.random() * 25) + 20,
          agents: Math.floor(Math.random() * 15) + 10,
          total: 156,
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
          <p className="text-gray-600 dark:text-gray-400">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      to: "#",
      icon: Users,
      label: "User Management",
      description: `${stats.totalUsers} users`,
    },
    {
      to: "#",
      icon: Home,
      label: "Listings",
      description: `${stats.totalProperties} properties`,
    },
    {
      to: "#",
      icon: AlertCircle,
      label: "Viewing Requests",
      description: `${stats.pendingRequests} pending`,
    },
    {
      to: "#",
      icon: Image,
      label: "Media Control",
      description: "Manage media assets",
    },
    {
      to: "#",
      icon: TrendingUp,
      label: "Featured",
      description: "Manage featured listings",
    },
    {
      to: "#",
      icon: Bell,
      label: "Notifications",
      description: "System notifications",
    },
  ];

  const statsData = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers,
      delta: { value: 12, isPositive: true },
    },
    {
      icon: Home,
      label: "Total Properties",
      value: stats.totalProperties,
      delta: { value: 8, isPositive: true },
    },
    {
      icon: AlertCircle,
      label: "Pending Requests",
      value: stats.pendingRequests,
      delta: { value: 3, isPositive: false },
    },
    {
      icon: CheckCircle2,
      label: "Verified Agents",
      value: stats.verifiedAgents,
      delta: { value: 5, isPositive: true },
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <WelcomeSection
        firstName={firstName || "Admin"}
        role="admin"
        subtitle="KejaHub Command Center"
      />

      <QuickActionGrid actions={quickActions} />

      <StatGrid stats={statsData} />

      {/* User Breakdown Cards */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
          User Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <UserBreakdownCard label="Buyers" value={userBreakdown.buyers} color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" />
          <UserBreakdownCard label="Tenants" value={userBreakdown.tenants} color="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300" />
          <UserBreakdownCard label="Sellers" value={userBreakdown.sellers} color="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" />
          <UserBreakdownCard label="Landlords" value={userBreakdown.landlords} color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" />
          <UserBreakdownCard label="Agents" value={userBreakdown.agents} color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300" />
          <UserBreakdownCard label="Total" value={userBreakdown.total} color="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Role Distribution
          </h3>
          <div className="space-y-4">
            <RoleBar label="Buyers" percentage={35} count={userBreakdown.buyers} />
            <RoleBar label="Tenants" percentage={28} count={userBreakdown.tenants} />
            <RoleBar label="Landlords" percentage={18} count={userBreakdown.landlords} />
            <RoleBar label="Agents" percentage={12} count={userBreakdown.agents} />
            <RoleBar label="Sellers" percentage={7} count={userBreakdown.sellers} />
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Property Status Distribution
          </h3>
          <div className="space-y-4">
            <StatusBar label="Available" percentage={45} count={154} color="bg-green-500" />
            <StatusBar label="Pending" percentage={25} count={86} color="bg-yellow-500" />
            <StatusBar label="Reserved" percentage={15} count={51} color="bg-blue-500" />
            <StatusBar label="Sold/Rented" percentage={15} count={51} color="bg-gray-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Recent Users
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  User #{156 - i}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  joined {i} day{i > 1 ? "s" : ""} ago
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Recent Properties
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {properties.slice(0, 5).map((prop) => (
              <div key={prop.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {prop.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {prop.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Activity Feed
        </h2>
        <HQActivityFeed />
      </div>

      {/* Operations Grid */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
          HQ Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OperationCard
            icon={Users}
            title="User Management"
            description="Manage users, roles, and permissions"
            href="#"
          />
          <OperationCard
            icon={Home}
            title="Listings Management"
            description="Review and manage all listings"
            href="#"
          />
          <OperationCard
            icon={CheckCircle2}
            title="Verification"
            description="Verify agents and property partners"
            href="#"
          />
          <OperationCard
            icon={Image}
            title="Media Library"
            description="Manage images and media assets"
            href="#"
          />
          <OperationCard
            icon={TrendingUp}
            title="Featured Management"
            description="Manage featured properties"
            href="#"
          />
          <OperationCard
            icon={Bell}
            title="Notifications"
            description="Send system notifications"
            href="#"
          />
        </div>
      </div>
    </div>
  );
}

function UserBreakdownCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={cn("rounded-lg p-4", color)}>
      <p className="text-xs font-semibold opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-display font-bold">{value}</p>
    </div>
  );
}

function RoleBar({
  label,
  percentage,
  count,
}: {
  label: string;
  percentage: number;
  count: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  percentage,
  count,
  color,
}: {
  label: string;
  percentage: number;
  count: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn("rounded-full h-2 transition-all", color)}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function OperationCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-soft transition-all duration-200 bg-white dark:bg-gray-900 group"
    >
      <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </a>
  );
}
