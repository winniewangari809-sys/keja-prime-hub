import { useState, useEffect } from "react";
import { useRequireRole } from "@/hooks/use-require-role";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Users,
  Home,
  Building2,
  Sofa,
  Store,
  AlertTriangle,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const AdminPage = () => {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    houseHuntingRequests: 0,
    airbnbBookings: 0,
    commercialRequests: 0,
    securityAlerts: 0,
  });

  // Data
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [houseHuntingRequests, setHouseHuntingRequests] = useState<any[]>([]);
  const [airbnbBookings, setAirbnbBookings] = useState<any[]>([]);
  const [commercialRequests, setCommercialRequests] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stats
      const propertiesCount = await supabase.from("properties").select("id", { count: "exact" });
      const usersCount = await supabase.from("profiles").select("id", { count: "exact" });
      const houseHuntingCount = await supabase
        .from("house_hunting_requests")
        .select("id", { count: "exact" });
      const airbnbCount = await supabase.from("airbnb_bookings").select("id", { count: "exact" });
      const commercialCount = await supabase
        .from("commercial_requests")
        .select("id", { count: "exact" });
      const alertsCount = await supabase.from("security_alerts").select("id", { count: "exact" });

      setStats({
        properties: propertiesCount.count || 0,
        users: usersCount.count || 0,
        houseHuntingRequests: houseHuntingCount.count || 0,
        airbnbBookings: airbnbCount.count || 0,
        commercialRequests: commercialCount.count || 0,
        securityAlerts: alertsCount.count || 0,
      });

      // Load detailed data
      const [propData, userData, hhData, abData, commData, alertData] = await Promise.all([
        supabase.from("properties").select("*").limit(100),
        supabase
          .from("profiles")
          .select("id, first_name, full_name, email:auth.users(email)")
          .limit(100),
        supabase.from("house_hunting_requests").select("*").limit(100),
        supabase.from("airbnb_bookings").select("*").limit(100),
        supabase.from("commercial_requests").select("*").limit(100),
        supabase.from("security_alerts").select("*").limit(100),
      ]);

      setProperties(propData.data || []);
      setUsers(userData.data || []);
      setHouseHuntingRequests(hhData.data || []);
      setAirbnbBookings(abData.data || []);
      setCommercialRequests(commData.data || []);
      setSecurityAlerts(alertData.data || []);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "approved" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Property approved");
      loadData();
    } catch (err) {
      toast.error("Failed to approve property");
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Property rejected");
      loadData();
    } catch (err) {
      toast.error("Failed to reject property");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container-app py-6">
          <h1 className="text-3xl font-bold text-slate-900">HQ Command Center</h1>
          <p className="mt-1 text-slate-600">Manage the KejaHub platform</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="house-hunting">House Hunting</TabsTrigger>
            <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.properties}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.users}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    House Hunting Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.houseHuntingRequests}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sofa className="h-5 w-5" />
                    Airbnb Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.airbnbBookings}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Commercial Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.commercialRequests}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Security Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.securityAlerts}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties */}
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Manage all properties on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : properties.length === 0 ? (
                  <p className="text-slate-600">No properties found</p>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{property.title}</p>
                          <p className="text-sm text-slate-600">{property.location}</p>
                          <Badge className="mt-2">{property.admin_status || "pending"}</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleApproveProperty(property.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRejectProperty(property.id)}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>View all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : users.length === 0 ? (
                  <p className="text-slate-600">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{user.full_name}</p>
                          <p className="text-sm text-slate-600">{user.first_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* House Hunting */}
          <TabsContent value="house-hunting">
            <Card>
              <CardHeader>
                <CardTitle>House Hunting Requests</CardTitle>
                <CardDescription>View all house hunting concierge requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : houseHuntingRequests.length === 0 ? (
                  <p className="text-slate-600">No requests found</p>
                ) : (
                  <div className="space-y-2">
                    {houseHuntingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <p className="font-semibold text-slate-900">{req.name}</p>
                        <p className="text-sm text-slate-600">{req.email}</p>
                        <p className="text-sm text-slate-600">{req.area}</p>
                        <Badge className="mt-2">{req.property_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airbnb */}
          <TabsContent value="airbnb">
            <Card>
              <CardHeader>
                <CardTitle>Airbnb Bookings</CardTitle>
                <CardDescription>View all Airbnb bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : airbnbBookings.length === 0 ? (
                  <p className="text-slate-600">No bookings found</p>
                ) : (
                  <div className="space-y-2">
                    {airbnbBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <p className="font-semibold text-slate-900">
                          Booking #{booking.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {booking.check_in} to {booking.check_out}
                        </p>
                        <p className="text-sm text-slate-600">Guests: {booking.guests}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commercial */}
          <TabsContent value="commercial">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Requests</CardTitle>
                <CardDescription>View all commercial space requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : commercialRequests.length === 0 ? (
                  <p className="text-slate-600">No requests found</p>
                ) : (
                  <div className="space-y-2">
                    {commercialRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <p className="font-semibold text-slate-900">{req.name}</p>
                        <p className="text-sm text-slate-600">{req.email}</p>
                        <p className="text-sm text-slate-600">{req.business_type}</p>
                        <Badge className="mt-2">{req.area}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>View all security alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-slate-600">Loading...</p>
                ) : securityAlerts.length === 0 ? (
                  <p className="text-slate-600">No alerts found</p>
                ) : (
                  <div className="space-y-2">
                    {securityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="rounded-lg border border-red-200 bg-red-50 p-4"
                      >
                        <p className="font-semibold text-red-900">{alert.alert_type}</p>
                        <p className="text-sm text-red-700">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
