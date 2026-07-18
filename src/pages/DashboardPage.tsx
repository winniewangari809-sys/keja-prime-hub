import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, Home, Building2, Warehouse, Briefcase, BarChart3, Shield } from "lucide-react";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, role, firstName, loading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome, {firstName || user.email}!
            </h1>
            <p className="text-gray-600 mt-2">
              Role: <span className="font-semibold capitalize">{role || "User"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/settings">
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Admin Section */}
        {(role === "hq" || role === "admin") && (
          <div className="mb-8">
            <Link to="/admin">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                    <div>
                      <CardTitle>HQ Command Center</CardTitle>
                      <CardDescription>Manage platform, users, and security</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        )}

        {/* Role-Based Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buyer/Tenant Options */}
          {(role === "buyer" || role === "tenant") && (
            <>
              <Link to="/house-hunting">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-green-600" />
                      <div>
                        <CardTitle>House Hunting</CardTitle>
                        <CardDescription>Find your perfect home with our concierge</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Get personalized assistance from our team to find exactly what you're looking for.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/rentals">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Home className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle>Rentals</CardTitle>
                        <CardDescription>Browse available rental properties</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Explore a wide range of rental apartments and houses across Kenya.</p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {/* Seller/Landlord Options */}
          {(role === "seller" || role === "landlord") && (
            <Link to="/rentals">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    <div>
                      <CardTitle>My Listings</CardTitle>
                      <CardDescription>Manage and view your rental properties</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">View all your listed properties and manage rental listings.</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Airbnb Host Options */}
          {role === "airbnb" && (
            <Link to="/airbnb">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Warehouse className="w-6 h-6 text-purple-600" />
                    <div>
                      <CardTitle>Airbnb Listings</CardTitle>
                      <CardDescription>Manage your vacation property bookings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">View bookings and manage your short-term vacation property.</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Commercial Owner Options */}
          {role === "commercial" && (
            <Link to="/commercial">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-red-600" />
                    <div>
                      <CardTitle>Commercial Spaces</CardTitle>
                      <CardDescription>Manage your business property listings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">View and manage commercial space inquiries.</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Explore Properties - Available for all */}
          <Link to="/rentals">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Home className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle>Browse Properties</CardTitle>
                    <CardDescription>Explore available rental listings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Discover rental properties across Kenya.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};
