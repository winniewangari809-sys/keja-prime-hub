import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Users, Home, ShoppingCart, AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

interface DashboardStats {
  total_properties: number;
  total_users: number;
  total_requests: number;
  total_bookings: number;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  description: string;
  severity: string;
  created_at: string;
}

function AdminComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_properties: 0,
    total_users: 0,
    total_requests: 0,
    total_bookings: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate({ to: "/login" });
        return;
      }

      // Check user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (roleError || !roleData || (roleData.role !== "hq" && roleData.role !== "admin")) {
        toast.error("You do not have access to this page");
        navigate({ to: "/dashboard" });
        return;
      }

      await fetchAllData();
    };

    checkAuthAndFetchData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      // Fetch properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("id, title, property_type, status")
        .limit(10);

      if (propertiesData) {
        setProperties(propertiesData);
      }

      // Fetch users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .limit(10);

      if (usersData) {
        setUsers(usersData);
      }

      // Fetch security alerts
      const { data: alertsData } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (alertsData) {
        setSecurityAlerts(alertsData);
      }

      // Fetch stats
      const { count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: requestsCount } = await supabase
        .from("house_hunting_requests")
        .select("*", { count: "exact", head: true });

      const { count: bookingsCount } = await supabase
        .from("airbnb_bookings")
        .select("*", { count: "exact", head: true });

      setStats({
        total_properties: propertiesCount || 0,
        total_users: usersCount || 0,
        total_requests: requestsCount || 0,
        total_bookings: bookingsCount || 0,
      });

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load admin data");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
      return;
    }
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                HQ Command Center
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.total_properties}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Active listings on platform
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.total_users}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">House Hunting Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.total_requests}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Pending requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Airbnb Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.total_bookings}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Total bookings
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>
                  Overall system status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Status</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Services</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                    Running
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Properties Management
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>
                  Manage and review property listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold">Title</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-600">
                            No properties found
                          </td>
                        </tr>
                      ) : (
                        properties.map((property) => (
                          <tr key={property.id} className="border-b border-gray-200 dark:border-slate-700">
                            <td className="py-3 px-4">{property.title}</td>
                            <td className="py-3 px-4">{property.property_type}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded">
                                {property.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Users Management
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-gray-600">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700">
                            <td className="py-3 px-4">
                              {user.first_name} {user.last_name}
                            </td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              House Hunting Requests
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  Manage house hunting concierge requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Request management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Airbnb Bookings
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  Manage Airbnb property bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Booking management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Security Alerts
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>
                  Monitor system security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityAlerts.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No security alerts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {securityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                            alert.severity === "high"
                              ? "text-red-600"
                              : alert.severity === "medium"
                              ? "text-orange-600"
                              : "text-yellow-600"
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {alert.alert_type}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            alert.severity === "high"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                              : alert.severity === "medium"
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
