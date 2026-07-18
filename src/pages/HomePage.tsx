import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2, Plane, Store } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-50">
      {/* Hero Section */}
      <div className="container-app py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">KejaHub</h1>
          <p className="text-xl text-blue-100 mb-8">
            Find your perfect home across Kenya
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Property Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/rentals" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Home className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse available rental properties across Kenya
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/house-hunting" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Home className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>House Hunting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get personalized assistance finding your dream home
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/airbnb" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Plane className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Airbnb</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book short-term stays and vacation rentals
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/commercial" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Store className="w-10 h-10 text-orange-600 mb-2" />
                <CardTitle>Commercial</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find commercial spaces for your business
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
