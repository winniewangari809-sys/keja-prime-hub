import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2, Warehouse, Briefcase } from "lucide-react";

export const HomePage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container-app text-center text-white">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg">KejaHub</h1>
          <p className="text-xl md:text-2xl font-light mb-12 drop-shadow-md">Find your perfect home across Kenya</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-app">
          <h2 className="text-4xl font-bold text-center mb-12">Explore Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rentals */}
            <Link to="/rentals">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-8 h-8 text-blue-600" />
                    <CardTitle>Rentals</CardTitle>
                  </div>
                  <CardDescription>Find apartments and houses to rent</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Browse available rental properties across Kenya</p>
                </CardContent>
              </Card>
            </Link>

            {/* House Hunting */}
            <Link to="/house-hunting">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <CardTitle>House Hunting</CardTitle>
                  </div>
                  <CardDescription>Looking for your dream home?</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Get personalized assistance from our concierge team</p>
                </CardContent>
              </Card>
            </Link>

            {/* Airbnb */}
            <Link to="/airbnb">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Warehouse className="w-8 h-8 text-purple-600" />
                    <CardTitle>Airbnb</CardTitle>
                  </div>
                  <CardDescription>Short-term vacation stays</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Book unique properties for your travels</p>
                </CardContent>
              </Card>
            </Link>

            {/* Commercial */}
            <Link to="/commercial">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-8 h-8 text-orange-600" />
                    <CardTitle>Commercial</CardTitle>
                  </div>
                  <CardDescription>Business spaces available</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Find the perfect space for your business</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="container-app text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your perfect space?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of Kenyans who've found their ideal homes and business spaces through KejaHub</p>
          <Link to="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Create Your Account Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
