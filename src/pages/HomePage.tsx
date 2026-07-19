import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Building2, Sofa, Store } from "lucide-react";

export const HomePage = () => {
  const propertyTypes = [
    {
      icon: Home,
      title: "House Hunting",
      description: "Find your dream home with our concierge service",
      link: "/house-hunting",
      color: "text-blue-600",
    },
    {
      icon: Building2,
      title: "Rentals",
      description: "Explore rental properties across Kenya",
      link: "/rentals",
      color: "text-green-600",
    },
    {
      icon: Sofa,
      title: "Airbnb",
      description: "Book short-term accommodations",
      link: "/airbnb",
      color: "text-pink-600",
    },
    {
      icon: Store,
      title: "Commercial",
      description: "Find commercial spaces for your business",
      link: "/commercial",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />
        </div>
        <div className="container-app relative">
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
              KejaHub
            </h1>
            <p className="mb-8 text-xl text-slate-300 md:text-2xl">
              Find your perfect home across Kenya
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white hover:text-slate-900 sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Property Types Section */}
      <div className="bg-slate-50 py-24">
        <div className="container-app">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Explore Properties
            </h2>
            <p className="text-lg text-slate-600">
              Choose what works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {propertyTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Link key={type.link} to={type.link}>
                  <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                    <CardHeader>
                      <IconComponent className={`mb-2 h-8 w-8 ${type.color}`} />
                      <CardTitle>{type.title}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Browse
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-16">
        <div className="container-app text-center">
          <h3 className="mb-4 text-2xl font-bold text-slate-900">
            Ready to find your perfect property?
          </h3>
          <p className="mb-8 text-slate-600">
            Join thousands of Kenyans using KejaHub to find their ideal homes
          </p>
          <Link to="/signup">
            <Button size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
