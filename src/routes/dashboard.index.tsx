import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Home, ShoppingBag, Building2, Briefcase, Sofa, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardComponent,
});

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserRole {
  role: string;
}

function DashboardComponent() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate({ to: "/login" });
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        toast.error("Failed to load profile");
        setLoading(false);
        return;
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!roleError && roleData) {
        setUserRole(roleData);
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
      return;
    }
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Failed to load your profile. Please try again.
            </p>
            <Button onClick={() => navigate({ to: "/login" })} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const role = userRole?.role || "user";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">KejaHub</h1>
            </div>
            <div className="flex gap-4 items-center">
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile.first_name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your properties, bookings, and requests all in one place
          </p>
        </div>

        {/* HQ/Admin Dashboard */}
        {(role === "hq" || role === "admin") && (
          <div className="mb-8">
            <Link to="/admin">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                    <div>
                      <CardTitle>HQ Command Center</CardTitle>
                      <CardDescription>
                        Manage platform, users, and listings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        )}

        {/* Role-Based Dashboard Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer/Tenant - House Hunting & Saved Properties */}
          {(role === "buyer" || role === "tenant") && (
            <>
              <Link to="/house-hunting">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-8 h-8 text-green-600" />
                      <div>
                        <CardTitle>House Hunting</CardTitle>
                        <CardDescription>
                          Get concierge assistance
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Submit your requirements and let our team help you find the perfect property.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/rentals">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Home className="w-8 h-8 text-blue-600" />
                      <div>
                        <CardTitle>Saved Properties</CardTitle>
                        <CardDescription>
                          View your favorites
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access your saved properties and continue your search.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {/* Seller/Landlord - My Listings & Packages */}
          {(role === "seller" || role === "landlord") && (
            <>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-orange-600" />
                    <div>
                      <CardTitle>My Listings</CardTitle>
                      <CardDescription>
                        Manage your properties
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    View and manage all your listed properties.
                  </p>
                  <Button className="w-full">View Listings</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-red-600" />
                    <div>
                      <CardTitle>Packages</CardTitle>
                      <CardDescription>
                        Upgrade your account
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Choose a package to boost your listings.
                  </p>
                  <Button className="w-full">View Packages</Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Airbnb - Bookings */}
          {role === "airbnb" && (
            <>
              <Link to="/airbnb">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Sofa className="w-8 h-8 text-orange-600" />
                      <div>
                        <CardTitle>Airbnb Bookings</CardTitle>
                        <CardDescription>
                          Manage your bookings
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View and manage all your Airbnb bookings and reservations.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle>List Property</CardTitle>
                      <CardDescription>
                        Add a new property
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create a new Airbnb listing.
                  </p>
                  <Button className="w-full">Add Property</Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Commercial - Requests */}
          {role === "commercial" && (
            <>
              <Link to="/commercial">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-8 h-8 text-purple-600" />
                      <div>
                        <CardTitle>Commercial Requests</CardTitle>
                        <CardDescription>
                          Submit space requests
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Submit your commercial space requirements and we'll help you find the perfect location.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <div>
                      <CardTitle>Available Spaces</CardTitle>
                      <CardDescription>
                        Browse options
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Explore available commercial spaces.
                  </p>
                  <Button className="w-full">Browse Spaces</Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Agent - Listings & Packages */}
          {role === "agent" && (
            <>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle>Manage Listings</CardTitle>
                      <CardDescription>
                        Your agent listings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    View and manage all your agent listings.
                  </p>
                  <Button className="w-full">View Listings</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-orange-600" />
                    <div>
                      <CardTitle>Commission</CardTitle>
                      <CardDescription>
                        Track earnings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    View your commission and earnings.
                  </p>
                  <Button className="w-full">View Earnings</Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
