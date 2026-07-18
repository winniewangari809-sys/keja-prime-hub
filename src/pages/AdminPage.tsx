import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader, LogOut, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useRequireRole } from '@/hooks/use-require-role';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  admin_status: string;
}

interface Profile {
  id: string;
  first_name: string;
  full_name: string;
  email: string;
}

interface UserWithRole extends Profile {
  role: string;
}

interface HouseHuntingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  budget_min: number;
  budget_max: number;
  status: string;
}

interface AirbnbBooking {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
}

interface CommercialRequest {
  id: string;
  name: string;
  email: string;
  business_type: string;
  status: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  description: string;
  severity: string;
  created_at: string;
}

interface Stat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  useRequireRole(['hq', 'admin']);

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [houseHunting, setHouseHunting] = useState<HouseHuntingRequest[]>([]);
  const [airbnbBookings, setAirbnbBookings] = useState<AirbnbBooking[]>([]);
  const [commercialRequests, setCommercialRequests] = useState<CommercialRequest[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllData();
    }
  }, [user, authLoading]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch counts for stats
      const [propertiesRes, profilesRes, houseHuntingRes, airbnbRes, commercialRes, securityRes] =
        await Promise.all([
          supabase.from('properties').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('house_hunting_requests').select('id', { count: 'exact' }),
          supabase.from('airbnb_bookings').select('id', { count: 'exact' }),
          supabase.from('commercial_requests').select('id', { count: 'exact' }),
          supabase.from('security_alerts').select('id', { count: 'exact' }),
        ]);

      setStats([
        {
          label: 'Total Properties',
          value: propertiesRes.count || 0,
          icon: <AlertCircle className="w-5 h-5 text-blue-400" />,
        },
        {
          label: 'Total Users',
          value: profilesRes.count || 0,
          icon: <AlertCircle className="w-5 h-5 text-green-400" />,
        },
        {
          label: 'House Hunting Requests',
          value: houseHuntingRes.count || 0,
          icon: <AlertCircle className="w-5 h-5 text-purple-400" />,
        },
        {
          label: 'Airbnb Bookings',
          value: airbnbRes.count || 0,
          icon: <AlertCircle className="w-5 h-5 text-orange-400" />,
        },
        {
          label: 'Commercial Requests',
          value: commercialRes.count || 0,
          icon: <AlertCircle className="w-5 h-5 text-pink-400" />,
        },
        {
          label: 'Security Alerts',
          value: securityRes.count || 0,
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
        },
      ]);

      // Fetch properties
      const { data: propertiesData } = await supabase.from('properties').select('*').limit(20);
      setProperties(propertiesData || []);

      // Fetch users with roles
      const { data: usersData } = await supabase.from('profiles').select('id, first_name, full_name').limit(20);
      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');

      if (usersData && rolesData) {
        const usersWithRoles = usersData.map((user) => ({
          ...user,
          email: '',
          role: rolesData.find((r) => r.user_id === user.id)?.role || 'unknown',
        }));
        setUsers(usersWithRoles);
      }

      // Fetch house hunting requests
      const { data: hhData } = await supabase.from('house_hunting_requests').select('*').limit(20);
      setHouseHunting(hhData || []);

      // Fetch airbnb bookings
      const { data: airbnbData } = await supabase.from('airbnb_bookings').select('*').limit(20);
      setAirbnbBookings(airbnbData || []);

      // Fetch commercial requests
      const { data: commercialData } = await supabase.from('commercial_requests').select('*').limit(20);
      setCommercialRequests(commercialData || []);

      // Fetch security alerts
      const { data: securityData } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setSecurityAlerts(securityData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ admin_status: 'approved' })
        .eq('id', propertyId);

      if (error) {
        toast.error('Failed to approve property');
      } else {
        toast.success('Property approved');
        fetchAllData();
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ admin_status: 'rejected' })
        .eq('id', propertyId);

      if (error) {
        toast.error('Failed to reject property');
      } else {
        toast.success('Property rejected');
        fetchAllData();
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-app h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">HQ Command Center</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700 grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="hunting">Hunting</TabsTrigger>
            <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <Card key={idx} className="border-slate-700 bg-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                      </div>
                      {stat.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Manage and approve property listings</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No properties found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-400">Title</th>
                          <th className="text-left py-3 px-3 text-slate-400">Location</th>
                          <th className="text-left py-3 px-3 text-slate-400">Price</th>
                          <th className="text-left py-3 px-3 text-slate-400">Status</th>
                          <th className="text-left py-3 px-3 text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {properties.map((prop) => (
                          <tr key={prop.id} className="hover:bg-slate-700/30">
                            <td className="py-3 px-3 text-white">{prop.title}</td>
                            <td className="py-3 px-3 text-slate-400">{prop.location}</td>
                            <td className="py-3 px-3 text-slate-400">{formatPrice(prop.price)}</td>
                            <td className="py-3 px-3">
                              <Badge
                                variant={prop.admin_status === 'approved' ? 'default' : 'secondary'}
                                className={
                                  prop.admin_status === 'approved'
                                    ? 'bg-green-600'
                                    : prop.admin_status === 'rejected'
                                      ? 'bg-red-600'
                                      : 'bg-yellow-600'
                                }
                              >
                                {prop.admin_status || 'pending'}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveProperty(prop.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleRejectProperty(prop.id)}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-400">Name</th>
                          <th className="text-left py-3 px-3 text-slate-400">Full Name</th>
                          <th className="text-left py-3 px-3 text-slate-400">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-700/30">
                            <td className="py-3 px-3 text-white">{user.first_name}</td>
                            <td className="py-3 px-3 text-slate-400">{user.full_name}</td>
                            <td className="py-3 px-3">
                              <Badge className="bg-blue-600">{user.role}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* House Hunting Tab */}
          <TabsContent value="hunting" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>House Hunting Requests</CardTitle>
                <CardDescription>View concierge service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {houseHunting.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No requests found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-400">Name</th>
                          <th className="text-left py-3 px-3 text-slate-400">Email</th>
                          <th className="text-left py-3 px-3 text-slate-400">Area</th>
                          <th className="text-left py-3 px-3 text-slate-400">Budget</th>
                          <th className="text-left py-3 px-3 text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {houseHunting.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-700/30">
                            <td className="py-3 px-3 text-white">{req.name}</td>
                            <td className="py-3 px-3 text-slate-400">{req.email}</td>
                            <td className="py-3 px-3 text-slate-400">{req.area}</td>
                            <td className="py-3 px-3 text-slate-400">
                              {formatPrice(req.budget_min)} - {formatPrice(req.budget_max)}
                            </td>
                            <td className="py-3 px-3">
                              <Badge className="bg-blue-600">{req.status || 'pending'}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airbnb Tab */}
          <TabsContent value="airbnb" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Airbnb Bookings</CardTitle>
                <CardDescription>View all airbnb bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {airbnbBookings.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No bookings found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-400">Property ID</th>
                          <th className="text-left py-3 px-3 text-slate-400">Check-in</th>
                          <th className="text-left py-3 px-3 text-slate-400">Check-out</th>
                          <th className="text-left py-3 px-3 text-slate-400">Guests</th>
                          <th className="text-left py-3 px-3 text-slate-400">Total Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {airbnbBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-700/30">
                            <td className="py-3 px-3 text-white">{booking.property_id}</td>
                            <td className="py-3 px-3 text-slate-400">{booking.check_in}</td>
                            <td className="py-3 px-3 text-slate-400">{booking.check_out}</td>
                            <td className="py-3 px-3 text-slate-400">{booking.guests}</td>
                            <td className="py-3 px-3 text-white">{formatPrice(booking.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commercial Tab */}
          <TabsContent value="commercial" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Commercial Requests</CardTitle>
                <CardDescription>View commercial space requests</CardDescription>
              </CardHeader>
              <CardContent>
                {commercialRequests.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No requests found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-400">Name</th>
                          <th className="text-left py-3 px-3 text-slate-400">Email</th>
                          <th className="text-left py-3 px-3 text-slate-400">Business Type</th>
                          <th className="text-left py-3 px-3 text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {commercialRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-700/30">
                            <td className="py-3 px-3 text-white">{req.name}</td>
                            <td className="py-3 px-3 text-slate-400">{req.email}</td>
                            <td className="py-3 px-3 text-slate-400">{req.business_type}</td>
                            <td className="py-3 px-3">
                              <Badge className="bg-blue-600">{req.status || 'pending'}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>Monitor system security events</CardDescription>
              </CardHeader>
              <CardContent>
                {securityAlerts.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No alerts found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left py-3 px-3 text-slate-400">Type</th>
                          <th className="text-left py-3 px-3 text-slate-400">Description</th>
                          <th className="text-left py-3 px-3 text-slate-400">Severity</th>
                          <th className="text-left py-3 px-3 text-slate-400">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {securityAlerts.map((alert) => (
                          <tr key={alert.id} className="hover:bg-slate-700/30">
                            <td className="py-3 px-3 text-white">{alert.alert_type}</td>
                            <td className="py-3 px-3 text-slate-400">{alert.description}</td>
                            <td className="py-3 px-3">
                              <Badge
                                className={
                                  alert.severity === 'critical'
                                    ? 'bg-red-600'
                                    : alert.severity === 'high'
                                      ? 'bg-orange-600'
                                      : 'bg-yellow-600'
                                }
                              >
                                {alert.severity}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-slate-400">
                              {new Date(alert.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
