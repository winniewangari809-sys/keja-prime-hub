import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRequireRole } from "@/hooks/use-require-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  status: string;
  admin_status: string;
}

interface Profile {
  id: string;
  first_name: string;
  full_name: string;
  email: string;
}

interface HouseHuntingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  property_type: string;
  created_at: string;
}

interface AirbnbBooking {
  id: string;
  created_at: string;
  check_in: string;
  check_out: string;
  guests: number;
}

interface CommercialRequest {
  id: string;
  name: string;
  email: string;
  business_type: string;
  area: string;
  created_at: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  created_at: string;
}

interface Stats {
  properties: number;
  users: number;
  houseHunting: number;
  airbnb: number;
  commercial: number;
  alerts: number;
}

export default function AdminPage() {
  useRequireRole(["hq", "admin"]);

  const [stats, setStats] = useState<Stats>({
    properties: 0,
    users: 0,
    houseHunting: 0,
    airbnb: 0,
    commercial: 0,
    alerts: 0,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [houseHunting, setHouseHunting] = useState<HouseHuntingRequest[]>([]);
  const [airbnb, setAirbnb] = useState<AirbnbBooking[]>([]);
  const [commercial, setCommercial] = useState<CommercialRequest[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const [propertiesCount, usersCount, hhCount, airbnbCount, commercialCount, alertsCount] =
        await Promise.all([
          supabase.from("properties").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("house_hunting_requests").select("*", { count: "exact", head: true }),
          supabase.from("airbnb_bookings").select("*", { count: "exact", head: true }),
          supabase.from("commercial_requests").select("*", { count: "exact", head: true }),
          supabase.from("security_alerts").select("*", { count: "exact", head: true }),
        ]);

      setStats({
        properties: propertiesCount.count || 0,
        users: usersCount.count || 0,
        houseHunting: hhCount.count || 0,
        airbnb: airbnbCount.count || 0,
        commercial: commercialCount.count || 0,
        alerts: alertsCount.count || 0,
      });

      // Fetch detailed data
      const [
        propertiesData,
        usersData,
        hhData,
        airbnbData,
        commercialData,
        alertsData,
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("id, title, price, location, status, admin_status")
          .limit(10),
        supabase.from("profiles").select("id, first_name, full_name, email").limit(10),
        supabase
          .from("house_hunting_requests")
          .select("id, name, phone, email, area, property_type, created_at")
          .limit(10),
        supabase.from("airbnb_bookings").select("id, created_at, check_in, check_out, guests").limit(10),
        supabase
          .from("commercial_requests")
          .select("id, name, email, business_type, area, created_at")
          .limit(10),
        supabase
          .from("security_alerts")
          .select("id, alert_type, severity, created_at")
          .limit(10),
      ]);

      setProperties(propertiesData.data || []);
      setUsers(usersData.data || []);
      setHouseHunting(hhData.data || []);
      setAirbnb(airbnbData.data || []);
      setCommercial(commercialData.data || []);
      setAlerts(alertsData.data || []);
    } catch (err) {
      toast.error("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "approved" })
        .eq("id", propertyId);

      if (error) {
        toast.error("Failed to approve property");
      } else {
        toast.success("Property approved");
        fetchData();
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "rejected" })
        .eq("id", propertyId);

      if (error) {
        toast.error("Failed to reject property");
      } else {
        toast.success("Property rejected");
        fetchData();
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container-app py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold mb-8">HQ Command Center</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="house-hunting">House Hunting</TabsTrigger>
            <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.properties}</p>
                  <CardDescription>Total listings</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.users}</p>
                  <CardDescription>Active accounts</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">House Hunting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.houseHunting}</p>
                  <CardDescription>Requests</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Airbnb</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.airbnb}</p>
                  <CardDescription>Bookings</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Commercial</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.commercial}</p>
                  <CardDescription>Requests</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.alerts}</p>
                  <CardDescription>Security issues</CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Manage and approve listings</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <p className="text-gray-600">No properties yet</p>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{property.title}</h3>
                          <p className="text-sm text-gray-600">{property.location}</p>
                          <p className="text-sm font-semibold mt-2">{formatPrice(property.price)}</p>
                          <Badge
                            variant="outline"
                            className="mt-2"
                          >
                            {property.admin_status || "pending"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveProperty(property.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectProperty(property.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
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
                <CardDescription>Active user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-gray-600">No users yet</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{u.full_name || u.first_name}</h3>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* House Hunting Tab */}
          <TabsContent value="house-hunting">
            <Card>
              <CardHeader>
                <CardTitle>House Hunting Requests</CardTitle>
                <CardDescription>Concierge service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {houseHunting.length === 0 ? (
                  <p className="text-gray-600">No requests yet</p>
                ) : (
                  <div className="space-y-4">
                    {houseHunting.map((req) => (
                      <div key={req.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{req.name}</h3>
                        <p className="text-sm text-gray-600">{req.email}</p>
                        <p className="text-sm text-gray-600">{req.phone}</p>
                        <p className="text-sm mt-2">
                          Looking for {req.property_type} in {req.area}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
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
                <CardDescription>Short-term rental bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {airbnb.length === 0 ? (
                  <p className="text-gray-600">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {airbnb.map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">
                          {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm">
                          {formatDate(booking.check_in)} to {formatDate(booking.check_out)}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(booking.created_at)}</p>
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
                {commercial.length === 0 ? (
                  <p className="text-gray-600">No requests yet</p>
                ) : (
                  <div className="space-y-4">
                    {commercial.map((req) => (
                      <div key={req.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{req.name}</h3>
                        <p className="text-sm text-gray-600">{req.email}</p>
                        <p className="text-sm mt-2">
                          {req.business_type} in {req.area}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
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
                <CardDescription>System security events</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-gray-600">No alerts</p>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{alert.alert_type}</h3>
                            <p className="text-xs text-gray-500">{formatDate(alert.created_at)}</p>
                          </div>
                          <Badge
                            variant={
                              alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
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
}
