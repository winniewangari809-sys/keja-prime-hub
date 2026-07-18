import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRequireRole } from '@/hooks/use-require-role';

interface StatCard {
  label: string;
  value: number;
  icon: string;
}

export default function AdminPage() {
  useRequireRole(['hq', 'admin']);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [houseHunting, setHouseHunting] = useState<any[]>([]);
  const [airbnbBookings, setAirbnbBookings] = useState<any[]>([]);
  const [commercial, setCommercial] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const [
        propertiesData,
        profilesData,
        houseHuntingData,
        airbnbData,
        commercialData,
        alertsData,
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('house_hunting_requests').select('*', { count: 'exact' }),
        supabase.from('airbnb_bookings').select('*', { count: 'exact' }),
        supabase.from('commercial_requests').select('*', { count: 'exact' }),
        supabase.from('security_alerts').select('*', { count: 'exact' }),
      ]);

      setStats([
        { label: 'Properties', value: propertiesData.count || 0, icon: '🏠' },
        { label: 'Users', value: profilesData.count || 0, icon: '👥' },
        { label: 'House Hunting', value: houseHuntingData.count || 0, icon: '🔍' },
        { label: 'Airbnb Bookings', value: airbnbData.count || 0, icon: '✈️' },
        { label: 'Commercial', value: commercialData.count || 0, icon: '🏢' },
        { label: 'Alerts', value: alertsData.count || 0, icon: '⚠️' },
      ]);

      // Fetch detailed data
      if (propertiesData.data) setProperties(propertiesData.data);
      if (houseHuntingData.data) setHouseHunting(houseHuntingData.data);
      if (airbnbData.data) setAirbnbBookings(airbnbData.data);
      if (commercialData.data) setCommercial(commercialData.data);
      if (alertsData.data) setSecurityAlerts(alertsData.data);

      // Fetch users with roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, first_name, full_name, email');

      if (!usersError && usersData) {
        setUsers(usersData);
      }
    } catch (err) {
      toast.error('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyApprove = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ admin_status: 'approved' })
        .eq('id', propertyId);

      if (error) {
        toast.error('Failed to approve property');
        return;
      }

      setProperties(
        properties.map((p) =>
          p.id === propertyId ? { ...p, admin_status: 'approved' } : p
        )
      );
      toast.success('Property approved');
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handlePropertyReject = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ admin_status: 'rejected' })
        .eq('id', propertyId);

      if (error) {
        toast.error('Failed to reject property');
        return;
      }

      setProperties(
        properties.map((p) =>
          p.id === propertyId ? { ...p, admin_status: 'rejected' } : p
        )
      );
      toast.success('Property rejected');
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-slate-900">HQ Command Center</h1>
            <p className="text-slate-600 mt-1">Platform administration and monitoring</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="househunting">House Hunting</TabsTrigger>
            <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <p className="text-slate-600">No properties yet</p>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="border border-slate-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {property.title}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {property.location} • KES {property.price?.toLocaleString()}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Badge
                              variant={
                                property.status === 'available'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {property.status}
                            </Badge>
                            <Badge
                              variant={
                                property.admin_status === 'approved'
                                  ? 'default'
                                  : property.admin_status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {property.admin_status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                        {property.admin_status !== 'approved' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePropertyApprove(property.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handlePropertyReject(property.id)}
                              size="sm"
                              variant="destructive"
                            >
                              Reject
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
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-slate-600">No users yet</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="border border-slate-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {user.full_name || user.first_name}
                          </h4>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* House Hunting Tab */}
          <TabsContent value="househunting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>House Hunting Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {houseHunting.length === 0 ? (
                  <p className="text-slate-600">No house hunting requests yet</p>
                ) : (
                  <div className="space-y-4">
                    {houseHunting.map((request) => (
                      <div
                        key={request.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-slate-900">
                          {request.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-slate-600">
                          <p>Phone: {request.phone}</p>
                          <p>Email: {request.email}</p>
                          <p>Area: {request.area}</p>
                          <p>Budget: KES {request.budget_min?.toLocaleString()} - {request.budget_max?.toLocaleString()}</p>
                          <p>Type: {request.property_type}</p>
                          <p>Move In: {new Date(request.move_in_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airbnb Tab */}
          <TabsContent value="airbnb" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Airbnb Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {airbnbBookings.length === 0 ? (
                  <p className="text-slate-600">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {airbnbBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <p className="text-sm text-slate-600">
                          <strong>Property ID:</strong> {booking.property_id}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Check-in:</strong> {new Date(booking.check_in).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Check-out:</strong> {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Guests:</strong> {booking.guests}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Total:</strong> KES {booking.total_price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commercial Tab */}
          <TabsContent value="commercial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {commercial.length === 0 ? (
                  <p className="text-slate-600">No commercial requests yet</p>
                ) : (
                  <div className="space-y-4">
                    {commercial.map((request) => (
                      <div
                        key={request.id}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-slate-900">
                          {request.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-slate-600">
                          <p>Phone: {request.phone}</p>
                          <p>Email: {request.email}</p>
                          <p>Business Type: {request.business_type}</p>
                          <p>Area: {request.area}</p>
                          <p>Budget: KES {request.budget?.toLocaleString()}</p>
                          <p>Parking: {request.parking_needed ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {securityAlerts.length === 0 ? (
                  <p className="text-slate-600">No security alerts</p>
                ) : (
                  <div className="space-y-3">
                    {securityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="border border-slate-200 rounded-lg p-3 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">
                              {alert.alert_type}
                            </h4>
                            <Badge
                              variant={
                                alert.severity === 'high'
                                  ? 'destructive'
                                  : alert.severity === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(alert.created_at).toLocaleString()}
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
      </div>
    </div>
  );
}
