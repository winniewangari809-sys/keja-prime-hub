import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2, Building, ShoppingCart } from "lucide-react";

export const HomePage = () => {
  const propertyTypes = [
    {
      title: "Rentals",
      description: "Find your perfect rental home",
      icon: Home,
      link: "/rentals",
      color: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "House Hunting",
      description: "Get personalized concierge service",
      icon: Building2,
      link: "/house-hunting",
      color: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Airbnb",
      description: "Book short-term stays",
      icon: Home,
      link: "/airbnb",
      color: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Commercial",
      description: "Explore business spaces",
      icon: Building,
      link: "/commercial",
      color: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="container-app mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            KejaHub
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Find your perfect home across Kenya
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Types Section */}
      <div className="container-app mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Link key={type.link} to={type.link}>
                <Card
                  className={`h-full ${type.color} ${type.borderColor} border-2 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-2`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="container-app mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose KejaHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Wide Selection</h3>
              <p className="text-gray-600">Access thousands of properties across Kenya</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Expert Support</h3>
              <p className="text-gray-600">Get personalized help from our concierge team</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Verified Listings</h3>
              <p className="text-gray-600">All properties are verified and legitimate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
