import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2, Plane, Store, LogOut, Settings, Shield } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, role, firstName, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const renderRoleContent = () => {
    switch (role) {
      case "hq":
      case "admin":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/admin">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Shield className="w-10 h-10 text-red-600 mb-2" />
                    <CardTitle>HQ Command Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Manage platform, properties, and users</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        );

      case "buyer":
      case "tenant":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome, {firstName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/house-hunting">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Home className="w-10 h-10 text-green-600 mb-2" />
                    <CardTitle>House Hunting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Get personalized assistance finding your dream home</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/rentals">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Home className="w-10 h-10 text-blue-600 mb-2" />
                    <CardTitle>Rentals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Browse available rental properties</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        );

      case "seller":
      case "landlord":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome, {firstName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="h-full">
                <CardHeader>
                  <Home className="w-10 h-10 text-purple-600 mb-2" />
                  <CardTitle>My Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Manage and view your property listings</CardDescription>
                </CardContent>
              </Card>
              <Link to="/rentals">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Home className="w-10 h-10 text-blue-600 mb-2" />
                    <CardTitle>View Market</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>See what's available in the market</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        );

      case "airbnb":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome, {firstName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <Link to="/airbnb">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Plane className="w-10 h-10 text-purple-600 mb-2" />
                    <CardTitle>Airbnb Listings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Manage your short-term rental properties</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        );

      case "commercial":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome, {firstName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <Link to="/commercial">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Store className="w-10 h-10 text-orange-600 mb-2" />
                    <CardTitle>Commercial Spaces</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Find commercial spaces for your business</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome, {firstName}</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">Select an option from the menu to get started.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-app py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back to KejaHub</p>
          </div>
          <div className="flex gap-3">
            <Link to="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {renderRoleContent()}
      </div>
    </div>
  );
}
