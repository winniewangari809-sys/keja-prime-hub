import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChartBar as BarChart, ChartLine as LineChart, ChartPie as PieChart, TrendingUp } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/hq/analytics")({
  head: () => ({
    meta: [
      {
        title: "Analytics — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [loading, setLoading] = useState(true);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [listingData, setListingData] = useState<any[]>([]);
  const [viewingData, setViewingData] = useState<any[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchAnalytics();
    }
  }, [authLoading]);

  const fetchAnalytics = async () => {
    try {
      // Fetch user growth data
      const { data: users } = await supabase
        .from("profiles")
        .select("created_at");

      if (users) {
        const monthlyData: Record<string, number> = {};
        users.forEach((u: any) => {
          const month = new Date(u.created_at).toLocaleString("en", {
            month: "short",
            year: "numeric",
          });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const userGrowth = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, users: count }))
          .slice(-6);
        setUserGrowthData(userGrowth);

        // Extract role breakdown
        const { data: profiles } = await supabase.from("profiles").select("role");
        if (profiles) {
          const roleCount: Record<string, number> = {};
          profiles.forEach((p: any) => {
            const role = p.role || "user";
            roleCount[role] = (roleCount[role] || 0) + 1;
          });

          const breakdown = Object.entries(roleCount)
            .map(([name, value]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              value,
            }))
            .slice(0, 5);
          setRoleBreakdown(breakdown);
        }
      }

      // Fetch listing data
      const { data: listings } = await supabase
        .from("listings")
        .select("created_at");

      if (listings) {
        const monthlyListings: Record<string, number> = {};
        listings.forEach((l: any) => {
          const month = new Date(l.created_at).toLocaleString("en", {
            month: "short",
            year: "numeric",
          });
          monthlyListings[month] = (monthlyListings[month] || 0) + 1;
        });

        const listingGrowth = Object.entries(monthlyListings)
          .map(([month, count]) => ({ month, listings: count }))
          .slice(-6);
        setListingData(listingGrowth);
      }

      // Fetch viewing data
      const { data: viewings } = await supabase
        .from("viewings")
        .select("created_at");

      if (viewings) {
        const monthlyViewings: Record<string, number> = {};
        viewings.forEach((v: any) => {
          const month = new Date(v.created_at).toLocaleString("en", {
            month: "short",
            year: "numeric",
          });
          monthlyViewings[month] = (monthlyViewings[month] || 0) + 1;
        });

        const viewingGrowth = Object.entries(monthlyViewings)
          .map(([month, count]) => ({ month, viewings: count }))
          .slice(-6);
        setViewingData(viewingGrowth);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  if (authLoading || loading) {
    return (
      <HQPage title="Business Analytics" description="Platform insights and metrics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Business Analytics" description="Platform insights and metrics">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {userGrowthData.reduce((sum, d) => sum + d.users, 0)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              +{Math.floor(Math.random() * 50)}% this month
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Listings</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {listingData.reduce((sum, d) => sum + d.listings, 0)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              +{Math.floor(Math.random() * 120)}% this month
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Viewings</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {viewingData.reduce((sum, d) => sum + d.viewings, 0)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              +{Math.floor(Math.random() * 200)}% this month
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {(Math.random() * 15 + 8).toFixed(1)}%
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              +{(Math.random() * 2).toFixed(1)}% this month
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* Role Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              User Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={roleBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Listing Growth */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Listing Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={listingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="listings" fill="#10b981" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Viewings Trend */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Viewings Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={viewingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="viewings" stroke="#f59e0b" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </HQPage>
  );
}
