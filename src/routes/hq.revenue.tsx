import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, ChartBar as BarChart3 } from "lucide-react";
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

export const Route = createFileRoute("/hq/revenue")({
  head: () => ({
    meta: [
      {
        title: "Revenue — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Revenue,
});

function Revenue() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [packageBreakdown, setPackageBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchRevenueData();
    }
  }, [authLoading]);

  const fetchRevenueData = async () => {
    try {
      // Mock revenue data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const revenue = months.map((month) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        transactions: Math.floor(Math.random() * 150) + 50,
      }));
      setRevenueData(revenue);

      const packages = [
        { name: "Seller Premium", value: 35 },
        { name: "Landlord Premium", value: 25 },
        { name: "Agent Pro", value: 20 },
        { name: "Airbnb Premium", value: 15 },
        { name: "Other", value: 5 },
      ];
      setPackageBreakdown(packages);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalTransactions = revenueData.reduce((sum, d) => sum + d.transactions, 0);
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  if (authLoading || loading) {
    return (
      <HQPage title="Revenue" description="Platform revenue and payment analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading revenue data...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Revenue" description="Platform revenue and payment analytics">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Revenue (6M)
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              KES {(totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              +18% year-over-year
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Transactions
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalTransactions}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              +12% this period
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Avg Transaction
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              KES {avgTransaction.toLocaleString("en", {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              Stable
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Recurring
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {Math.floor((totalRevenue * 0.65) / 1000)}K
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              65% of revenue
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* Package Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Package Sales Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={packageBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {packageBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Volume */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Transaction Volume
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="transactions" fill="#3b82f6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Breakdown
            </h3>
            <div className="space-y-2">
              {revenueData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.month}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      KES {item.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {item.transactions} transactions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HQPage>
  );
}
