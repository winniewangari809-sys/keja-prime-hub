import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRequireRole } from "@/hooks/use-require-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, AlertTriangle } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  admin_status: string;
}

interface Profile {
  id: string;
  first_name: string;
  full_name: string;
  email?: string;
}

interface HouseHuntingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  budget_min: number;
  budget_max: number;
  property_type: string;
  created_at: string;
}

interface AirbnbBooking {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  created_at: string;
}

interface CommercialRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  business_type: string;
  area: string;
  budget: number;
  created_at: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  description: string;
  severity: string;
  created_at: string;
}

export const AdminPage = () => {
  const { loading: roleLoading } = useRequireRole(["hq", "admin"]);

  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    houseHuntingRequests: 0,
    airbnbBookings: 0,
    commercialRequests: 0,
    securityAlerts: 0,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [houseHuntingRequests, setHouseHuntingRequests] = useState<HouseHuntingRequest[]>([]);
  const [airbnbBookings, setAirbnbBookings] = useState<AirbnbBooking[]>([]);
  const [commercialRequests, setCommercialRequests] = useState<CommercialRequest[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch properties
      const { data: propertiesData, count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact" });

      if (propertiesData) {
        setProperties(propertiesData as Property[]);
      }

      // Fetch profiles
      const { data: profilesData, count: profilesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });

      if (profilesData) {
        setProfiles(profilesData as Profile[]);
      }

      // Fetch house hunting requests
      const { data: houseHuntingData, count: houseHuntingCount } = await supabase
        .from("house_hunting_requests")
        .select("*", { count: "exact" });

      if (houseHuntingData) {
        setHouseHuntingRequests(houseHuntingData as HouseHuntingRequest[]);
      }

      // Fetch airbnb bookings
      const { data: airbnbData, count: airbnbCount } = await supabase
        .from("airbnb_bookings")
        .select("*", { count: "exact" });

      if (airbnbData) {
        setAirbnbBookings(airbnbData as AirbnbBooking[]);
      }

      // Fetch commercial requests
      const { data: commercialData, count: commercialCount } = await supabase
        .from("commercial_requests")
        .select("*", { count: "exact" });

      if (commercialData) {
        setCommercialRequests(commercialData as CommercialRequest[]);
      }

      // Fetch security alerts
      const { data: securityData, count: securityCount } = await supabase
        .from("security_alerts")
        .select("*", { count: "exact" });

      if (securityData) {
        setSecurityAlerts(securityData as SecurityAlert[]);
      }

      setStats({
        properties: propertiesCount || 0,
        users: profilesCount || 0,
        houseHuntingRequests: houseHuntingCount || 0,
        airbnbBookings: airbnbCount || 0,
        commercialRequests: commercialCount || 0,
        securityAlerts: securityCount || 0,
      });
    } catch (err) {
      toast.error("Failed to fetch admin data");
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

      if (error) {
        toast.error("Failed to approve property");
        return;
      }

      toast.success("Property approved");
      fetchAllData();
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ admin_status: "rejected" })
        .eq("id", id);

      if (error) {
        toast.error("Failed to reject property");
        return;
      }

      toast.success("Property rejected");
      fetchAllData();
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">HQ Command Center</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-app mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="house-hunting">House Hunting</TabsTrigger>
            <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.properties}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    House Hunting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.houseHuntingRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Airbnb Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.airbnbBookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Commercial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.commercialRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Security Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.securityAlerts}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Properties</CardTitle>
                <CardDescription>Review and approve listings</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No properties found</p>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{property.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {property.location} • {formatPrice(property.price)}
                          </p>
                          <div className="mt-2">
                            <Badge
                              variant={
                                property.admin_status === "approved"
                                  ? "default"
                                  : property.admin_status === "rejected"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {property.admin_status || "pending"}
                            </Badge>
                          </div>
                        </div>
                        {property.admin_status !== "approved" && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200"
                              onClick={() => handleApproveProperty(property.id)}
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200"
                              onClick={() => handleRejectProperty(property.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>User profiles and roles</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {profile.full_name || profile.first_name || "No name"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{profile.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* House Hunting Tab */}
          <TabsContent value="house-hunting" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>House Hunting Requests</CardTitle>
                <CardDescription>Concierge service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {houseHuntingRequests.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No requests found</p>
                ) : (
                  <div className="space-y-4">
                    {houseHuntingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                          <p>Phone: {request.phone}</p>
                          <p>Email: {request.email}</p>
                          <p>Area: {request.area}</p>
                          <p>Property Type: {request.property_type}</p>
                          <p>Budget: KES {request.budget_min} - {request.budget_max}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airbnb Tab */}
          <TabsContent value="airbnb" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Airbnb Bookings</CardTitle>
                <CardDescription>Short-term booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                {airbnbBookings.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {airbnbBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Property ID: {booking.property_id}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                              <p>Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
                              <p>Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
                              <p>Guests: {booking.guests}</p>
                              <p>Total: {formatPrice(booking.total_price)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commercial Tab */}
          <TabsContent value="commercial" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Requests</CardTitle>
                <CardDescription>Business space inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                {commercialRequests.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No requests found</p>
                ) : (
                  <div className="space-y-4">
                    {commercialRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                          <p>Phone: {request.phone}</p>
                          <p>Email: {request.email}</p>
                          <p>Business Type: {request.business_type}</p>
                          <p>Area: {request.area}</p>
                          <p>Budget: {formatPrice(request.budget)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>Platform security events</CardDescription>
              </CardHeader>
              <CardContent>
                {securityAlerts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No alerts found</p>
                ) : (
                  <div className="space-y-4">
                    {securityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-lg flex items-start gap-4 ${
                          alert.severity === "high" ? "bg-red-50 border-red-200" : ""
                        }`}
                      >
                        {alert.severity === "high" && <AlertTriangle className="text-red-600 mt-1" />}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{alert.alert_type}</h3>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={alert.severity === "high" ? "destructive" : "outline"}>
                              {alert.severity}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.created_at).toLocaleDateString()}
                            </p>
                          </div>
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
};
