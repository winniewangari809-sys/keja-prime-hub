import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Building2, Building, LogOut, LayoutDashboard, Zap } from "lucide-react";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, role, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const firstName = profile?.first_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {firstName}!</h1>
            <p className="text-gray-600 mt-1">Role: {role || "User"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app mx-auto px-4 py-12">
        {/* Admin Link */}
        {(role === "hq" || role === "admin") && (
          <div className="mb-8">
            <Link to="/admin">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 flex items-center gap-4">
                  <LayoutDashboard className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Admin Dashboard</h3>
                    <p className="text-sm text-blue-700">Manage properties, users, and platform</p>
                  </div>
                  <Zap className="w-5 h-5 text-blue-600 ml-auto" />
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Buyer/Tenant Section */}
          {(role === "buyer" || role === "tenant") && (
            <>
              <Link to="/house-hunting">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-6 h-6 text-green-600" />
                      <CardTitle>House Hunting</CardTitle>
                    </div>
                    <CardDescription>Get personalized concierge service</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/rentals">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Home className="w-6 h-6 text-blue-600" />
                      <CardTitle>Rentals</CardTitle>
                    </div>
                    <CardDescription>Browse available rental properties</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </>
          )}

          {/* Seller/Landlord Section */}
          {(role === "seller" || role === "landlord") && (
            <Link to="/rentals">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-6 h-6 text-blue-600" />
                    <CardTitle>My Listings</CardTitle>
                  </div>
                  <CardDescription>Manage your rental properties</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          {/* Airbnb Host Section */}
          {role === "airbnb" && (
            <Link to="/airbnb">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-6 h-6 text-orange-600" />
                    <CardTitle>Airbnb Listings</CardTitle>
                  </div>
                  <CardDescription>Manage your Airbnb properties</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          {/* Commercial Section */}
          {role === "commercial" && (
            <Link to="/commercial">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-6 h-6 text-purple-600" />
                    <CardTitle>Commercial Spaces</CardTitle>
                  </div>
                  <CardDescription>Find business spaces</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}

          {/* Settings Card */}
          <Link to="/settings">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-gray-600" />
                  <CardTitle>Settings</CardTitle>
                </div>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {role || "Not assigned"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600 font-semibold">Active</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Name:</strong> {profile?.full_name || "Not set"}
                </p>
                <p>
                  <strong>Phone:</strong> {profile?.phone || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/settings" className="text-blue-600 hover:text-blue-700 text-sm block">
                  Edit Profile
                </Link>
                <Link to="/settings" className="text-blue-600 hover:text-blue-700 text-sm block">
                  Change Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 text-sm block"
                >
                  Sign Out
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
