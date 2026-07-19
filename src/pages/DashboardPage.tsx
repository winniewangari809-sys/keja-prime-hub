import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Building2,
  Sofa,
  Store,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

export const DashboardPage = () => {
  const { user, role, firstName, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-slate-600">Please log in to view your dashboard</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container-app flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {firstName || "User"}
            </h1>
            <p className="mt-1 text-slate-600">
              Role: <span className="font-semibold capitalize">{role}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app py-12">
        {/* Admin/HQ Link */}
        {(role === "hq" || role === "admin") && (
          <div className="mb-8">
            <Link to="/admin">
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-4">
                    <LayoutDashboard className="h-8 w-8 text-slate-700" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Admin Panel</h3>
                      <p className="text-sm text-slate-600">HQ Command Center</p>
                    </div>
                  </div>
                  <Button variant="outline">Open</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        <Separator className="my-8" />

        {/* Role-Based Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Buyer/Tenant Section */}
          {(role === "buyer" || role === "tenant") && (
            <>
              <Link to="/house-hunting">
                <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      House Hunting
                    </CardTitle>
                    <CardDescription>Find your perfect home</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/rentals">
                <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Rentals
                    </CardTitle>
                    <CardDescription>Explore rental properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Rentals
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {/* Seller/Landlord Section */}
          {(role === "seller" || role === "landlord") && (
            <>
              <Link to="/rentals">
                <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      My Listings
                    </CardTitle>
                    <CardDescription>Manage your rental properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Listings
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {/* Airbnb Host Section */}
          {role === "airbnb" && (
            <Link to="/airbnb">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sofa className="h-5 w-5" />
                    Airbnb Listings
                  </CardTitle>
                  <CardDescription>Manage your Airbnb properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Listings
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Commercial Section */}
          {role === "commercial" && (
            <Link to="/commercial">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Commercial Spaces
                  </CardTitle>
                  <CardDescription>Find business spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Rentals Section */}
          {role === "buyer" && (
            <Link to="/rentals">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Rentals
                  </CardTitle>
                  <CardDescription>Explore rental properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Rentals
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Explore More</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Link to="/rentals">
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Building2 className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                  <p className="font-semibold">Rentals</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/house-hunting">
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Home className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <p className="font-semibold">House Hunting</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/airbnb">
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Sofa className="mx-auto mb-2 h-8 w-8 text-pink-600" />
                  <p className="font-semibold">Airbnb</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/commercial">
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <Store className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                  <p className="font-semibold">Commercial</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
