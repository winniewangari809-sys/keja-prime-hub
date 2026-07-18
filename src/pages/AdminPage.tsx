import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRequireRole } from "@/hooks/use-require-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, Users, Home, Briefcase, ShoppingCart, AlertTriangle } from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const AdminPage = () => {
  const { loading, user, role } = useRequireRole(["hq", "admin"]);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [houseHuntingRequests, setHouseHuntingRequests] = useState<any[]>([]);
  const [airbnbBookings, setAirbnbBookings] = useState<any[]>([]);
  const [commercialRequests, setCommercialRequests] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadData();
    }
  }, [loading, user]);

  const loadData = async () => {
    setPageLoading(true);
    try {
      // Load stats
      const [propertiesRes, profilesRes, houseHuntingRes, airbnbRes, commercialRes, securityRes] =
        await Promise.all([
          supabase.from("properties").select("id", { count: "exact" }),
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase.from("house_hunting_requests").select("id", { count: "exact" }),
          supabase.from("airbnb_bookings").select("id", { count: "exact" }),
          supabase.from("commercial_requests").select("id", { count: "exact" }),
          supabase.from("security_alerts").select("id", { count: "exact" }),
        ]);

      setStats([
        {
          title: "Total Properties",
          value: propertiesRes.count || 0,
          icon: <Home className="w-6 h-6" />,
          color: "bg-blue-100 text-blue-600",
        },
        {
          title: "Total Users",
          value: profilesRes.count || 0,
          icon: <Users className="w-6 h-6" />,
          color: "bg-green-100 text-green-600",
        },
        {
          title: "House Hunting Requests",
          value: houseHuntingRes.count || 0,
          icon: <BarChart3 className="w-6 h-6" />,
          color: "bg-purple-100 text-purple-600",
        },
        {
          title: "Airbnb Bookings",
          value: airbnbRes.count || 0,
          icon: <ShoppingCart className="w-6 h-6" />,
          color: "bg-orange-100 text-orange-600",
        },
        {
          title: "Commercial Requests",
          value: commercialRes.count || 0,
          icon: <Briefcase className="w-6 h-6" />,
          color: "bg-red-100 text-red-600",
        },
        {
          title: "Security Alerts",
          value: securityRes.count || 0,
          icon: <AlertTriangle className="w-6 h-6" />,
          color: "bg-yellow-100 text-yellow-600",
        },
      ]);

      // Load properties
      const { data: propsData } = await supabase
        .from("properties")
        .select("id, title, location, price, admin_status")
        .order("created_at", { ascending: false });
      setProperties(propsData || []);

      // Load users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, first_name, full_name, created_at")
        .order("created_at", { ascending: false });
      setUsers(usersData || []);

      // Load house hunting requests
      const { data: hhData } = await supabase
        .from("house_hunting_requests")
        .select("id, name, email, area, budget_min, budget_max, created_at")
        .order("created_at", { ascending: false });
      setHouseHuntingRequests(hhData || []);

      // Load airbnb bookings
      const { data: airbnbData } = await supabase
        .from("airbnb_bookings")
        .select("id, property_id, check_in, check_out, guests, created_at")
        .order("created_at", { ascending: false });
      setAirbnbBookings(airbnbData || []);

      // Load commercial requests
      const { data: commData } = await supabase
        .from("commercial_requests")
        .select("id, name, email, business_type, area, budget, created_at")
        .order("created_at", { ascending: false });
      setCommercialRequests(commData || []);

      // Load security alerts
      const { data: secData } = await supabase
        .from("security_alerts")
        .select("id, alert_type, description, created_at")
        .order("created_at", { ascending: false });
      setSecurityAlerts(secData || []);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setPageLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "approved" })
        .eq("id", propertyId);

      if (error) {
        toast.error(error.message || "Failed to approve property");
      } else {
        toast.success("Property approved!");
        loadData();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "rejected" })
        .eq("id", propertyId);

      if (error) {
        toast.error(error.message || "Failed to reject property");
      } else {
        toast.success("Property rejected!");
        loadData();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">HQ Command Center</h1>

        {/* Stats Cards */}
        {pageLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Admin Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="househunting">House Hunt</TabsTrigger>
                <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
                <TabsTrigger value="commercial">Commercial</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>Key metrics and statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stats.map((stat) => (
                        <div key={stat.title} className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Properties Tab */}
              <TabsContent value="properties">
                <Card>
                  <CardHeader>
                    <CardTitle>Properties</CardTitle>
                    <CardDescription>Manage all properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {properties.length === 0 ? (
                      <p className="text-gray-600">No properties found</p>
                    ) : (
                      <div className="space-y-3">
                        {properties.map((prop) => (
                          <div key={prop.id} className="flex items-center justify-between border-b pb-3">
                            <div>
                              <p className="font-medium">{prop.title}</p>
                              <p className="text-sm text-gray-600">{prop.location}</p>
                              <p className="text-sm font-semibold mt-1">KES {(prop.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Badge variant={prop.admin_status === "approved" ? "default" : prop.admin_status === "rejected" ? "destructive" : "outline"}>
                                {prop.admin_status || "pending"}
                              </Badge>
                              {prop.admin_status !== "approved" && (
                                <>
                                  <Button size="sm" onClick={() => handleApproveProperty(prop.id)}>
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectProperty(prop.id)}>
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>All registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {users.length === 0 ? (
                      <p className="text-gray-600">No users found</p>
                    ) : (
                      <div className="space-y-3">
                        {users.map((u) => (
                          <div key={u.id} className="flex justify-between border-b pb-3">
                            <div>
                              <p className="font-medium">{u.full_name || u.first_name || "Unknown"}</p>
                              <p className="text-sm text-gray-600">{u.id}</p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(u.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* House Hunting Tab */}
              <TabsContent value="househunting">
                <Card>
                  <CardHeader>
                    <CardTitle>House Hunting Requests</CardTitle>
                    <CardDescription>Concierge service requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {houseHuntingRequests.length === 0 ? (
                      <p className="text-gray-600">No house hunting requests</p>
                    ) : (
                      <div className="space-y-3">
                        {houseHuntingRequests.map((req) => (
                          <div key={req.id} className="border-b pb-3">
                            <p className="font-medium">{req.name}</p>
                            <p className="text-sm text-gray-600">{req.email}</p>
                            <p className="text-sm text-gray-600">
                              Area: {req.area} | Budget: KES {req.budget_min?.toLocaleString() || 0} - {req.budget_max?.toLocaleString() || 0}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Airbnb Tab */}
              <TabsContent value="airbnb">
                <Card>
                  <CardHeader>
                    <CardTitle>Airbnb Bookings</CardTitle>
                    <CardDescription>Short-term bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {airbnbBookings.length === 0 ? (
                      <p className="text-gray-600">No airbnb bookings</p>
                    ) : (
                      <div className="space-y-3">
                        {airbnbBookings.map((booking) => (
                          <div key={booking.id} className="border-b pb-3">
                            <p className="font-medium">Booking #{booking.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">
                              {booking.check_in} to {booking.check_out} | {booking.guests} guests
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Commercial Tab */}
              <TabsContent value="commercial">
                <Card>
                  <CardHeader>
                    <CardTitle>Commercial Requests</CardTitle>
                    <CardDescription>Business space inquiries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {commercialRequests.length === 0 ? (
                      <p className="text-gray-600">No commercial requests</p>
                    ) : (
                      <div className="space-y-3">
                        {commercialRequests.map((req) => (
                          <div key={req.id} className="border-b pb-3">
                            <p className="font-medium">{req.name}</p>
                            <p className="text-sm text-gray-600">{req.email}</p>
                            <p className="text-sm text-gray-600">
                              {req.business_type} | Area: {req.area} | Budget: KES {req.budget?.toLocaleString() || 0}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Alerts</CardTitle>
                    <CardDescription>Platform security events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {securityAlerts.length === 0 ? (
                      <p className="text-gray-600">No security alerts</p>
                    ) : (
                      <div className="space-y-3">
                        {securityAlerts.map((alert) => (
                          <div key={alert.id} className="border-b pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="destructive">{alert.alert_type}</Badge>
                                <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};
