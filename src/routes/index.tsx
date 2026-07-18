import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Key, Store, Building2, Briefcase, Sofa } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KejaHub</h1>
            </div>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect Kenyan Home
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover residential properties, commercial spaces, and investment opportunities across Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/house-hunting">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start House Hunting
              </Button>
            </Link>
            <Link to="/rentals">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Rentals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Explore Properties
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Find the perfect property for your needs
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rentals Card */}
          <Link to="/rentals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-8 h-8 text-blue-600" />
                  <CardTitle>Residential Rentals</CardTitle>
                </div>
                <CardDescription>
                  Find your perfect rental apartment or house
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse thousands of rental listings including apartments, houses, and studios in prime locations across Kenya.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* House Hunting Card */}
          <Link to="/house-hunting">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Home className="w-8 h-8 text-green-600" />
                  <CardTitle>House Hunting</CardTitle>
                </div>
                <CardDescription>
                  Get personalized real estate assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Let our concierge team help you find the perfect property that matches your budget and lifestyle needs.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Airbnb Card */}
          <Link to="/airbnb">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Sofa className="w-8 h-8 text-orange-600" />
                  <CardTitle>Vacation Rentals</CardTitle>
                </div>
                <CardDescription>
                  Book short-term stays and properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover unique vacation rentals and short-term properties perfect for your next getaway or business trip.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Commercial Card */}
          <Link to="/commercial">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-purple-600" />
                  <CardTitle>Commercial Spaces</CardTitle>
                </div>
                <CardDescription>
                  Find office and retail spaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore office spaces, retail shops, and commercial properties for your business needs.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Sell/Rent Card */}
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8 text-red-600" />
                <CardTitle>List Your Property</CardTitle>
              </div>
              <CardDescription>
                Become a property owner or agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                List your properties on KejaHub and reach thousands of potential buyers and tenants.
              </p>
              <Link to="/signup">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Agent Card */}
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-8 h-8 text-indigo-600" />
                <CardTitle>Become an Agent</CardTitle>
              </div>
              <CardDescription>
                Join our agent network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Partner with KejaHub and grow your real estate business with our platform.
              </p>
              <Link to="/signup">
                <Button className="w-full" variant="outline">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-slate-900 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose KejaHub?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">✓</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Verified Listings
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                All properties are verified for authenticity and quality
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">✓</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Expert Support
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Our team is available 24/7 to assist you
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">✓</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Secure Transactions
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Safe and secure payment processing for all deals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 KejaHub - Your Kenyan Real Estate Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
