import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader, LogOut, Settings, Home, Building2, Hotel, Store, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, full_name')
          .eq('id', user.id)
          .single();

        if (profileData?.first_name) {
          setFirstName(profileData.first_name);
        }

        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData?.role) {
          setUserRole(roleData.role);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-app h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">KejaHub</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, {firstName || 'Guest'}!
          </h2>
          <p className="text-slate-400">Manage your properties and bookings</p>
        </div>

        {/* Admin/HQ Dashboard */}
        {(userRole === 'hq' || userRole === 'admin') && (
          <div className="mb-8">
            <Link to="/admin">
              <Card className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <Shield className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Admin Dashboard</h3>
                      <p className="text-sm text-slate-400">HQ Command Center</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Role-Based Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(userRole === 'buyer' || userRole === 'tenant') && (
            <>
              <Link to="/house-hunting">
                <Card className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">House Hunting</h3>
                        <p className="text-sm text-slate-400">Find your dream home</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/rentals">
                <Card className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <Home className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Rentals</h3>
                        <p className="text-sm text-slate-400">Browse rental properties</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {(userRole === 'seller' || userRole === 'landlord' || userRole === 'agent') && (
            <Link to="/rentals">
              <Card className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Home className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">My Listings</h3>
                      <p className="text-sm text-slate-400">Manage your rentals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {userRole === 'airbnb' && (
            <Link to="/airbnb">
              <Card className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Hotel className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Airbnb</h3>
                      <p className="text-sm text-slate-400">Manage your listings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {userRole === 'commercial' && (
            <Link to="/commercial">
              <Card className="border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <Store className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Commercial</h3>
                      <p className="text-sm text-slate-400">Manage commercial spaces</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/rentals">
              <Button variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-800">
                Browse All Rentals
              </Button>
            </Link>
            <Link to="/house-hunting">
              <Button variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-800">
                House Hunting Service
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
