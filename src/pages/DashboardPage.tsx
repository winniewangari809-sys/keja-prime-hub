import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Home, Building, Briefcase, Building2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, role, firstName, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const renderRoleContent = () => {
    if (!role) return null;

    if (role === 'hq' || role === 'admin') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Admin Controls</h2>
          <Link to="/admin">
            <Card className="cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
              <CardContent className="p-6">
                <Building className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800">HQ Command Center</h3>
                <p className="text-slate-600 mt-2">Manage platform operations</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      );
    }

    if (role === 'buyer' || role === 'tenant') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Find Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/house-hunting">
              <Card className="h-full cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
                <CardContent className="p-6">
                  <Home className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800">House Hunting</h3>
                  <p className="text-slate-600 mt-2">Let us find your dream home</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/rentals">
              <Card className="h-full cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
                <CardContent className="p-6">
                  <Building className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800">Rentals</h3>
                  <p className="text-slate-600 mt-2">Browse available rentals</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      );
    }

    if (role === 'seller' || role === 'landlord') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Manage Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
              <CardContent className="p-6">
                <Building className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800">My Listings</h3>
                <p className="text-slate-600 mt-2">Manage your properties</p>
              </CardContent>
            </Card>
            <Link to="/rentals">
              <Card className="h-full cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
                <CardContent className="p-6">
                  <Home className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800">Rentals</h3>
                  <p className="text-slate-600 mt-2">Browse rental market</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      );
    }

    if (role === 'airbnb') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Airbnb Management</h2>
          <Link to="/airbnb">
            <Card className="cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
              <CardContent className="p-6">
                <Briefcase className="w-12 h-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800">Airbnb Listings</h3>
                <p className="text-slate-600 mt-2">Browse and manage listings</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      );
    }

    if (role === 'commercial') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Commercial Space</h2>
          <Link to="/commercial">
            <Card className="cursor-pointer hover:shadow-lg hover:bg-slate-50 transition-all">
              <CardContent className="p-6">
                <Building2 className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800">Commercial Requests</h3>
                <p className="text-slate-600 mt-2">Find business spaces</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {firstName || 'User'}!
              </h1>
              <p className="text-slate-600 mt-1">
                Role: {getRoleLabel(role)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        {renderRoleContent()}
      </div>
    </div>
  );
}
