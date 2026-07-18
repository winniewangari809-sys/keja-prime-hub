import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Building, Briefcase, Building2 } from 'lucide-react';

export default function HomePage() {
  const propertyTypes = [
    {
      title: 'Rentals',
      description: 'Find your perfect rental home',
      icon: Home,
      link: '/rentals',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'House Hunting',
      description: 'Let us find your dream home',
      icon: Building,
      link: '/house-hunting',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Airbnb',
      description: 'Browse vacation rentals',
      icon: Briefcase,
      link: '/airbnb',
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Commercial',
      description: 'Find business spaces',
      icon: Building2,
      link: '/commercial',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">KejaHub</span>
          </h1>
          <p className="mt-6 text-xl text-slate-300">
            Your premier platform for finding and listing properties across Kenya
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Types Section */}
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white mb-16">
            What are you looking for?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Link key={type.title} to={type.link}>
                  <Card className={`h-full bg-gradient-to-br ${type.gradient} border-0 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300`}>
                    <CardContent className="p-8 text-center text-white">
                      <Icon className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                      <p className="text-sm opacity-90">{type.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-20 sm:px-6 lg:px-8 bg-slate-800/50 border-t border-slate-700">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white mb-16">
            Why Choose KejaHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-blue-400 mb-4">10K+</div>
              <h3 className="text-lg font-semibold mb-2">Properties Listed</h3>
              <p className="text-slate-400">Browse thousands of verified properties</p>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-purple-400 mb-4">5K+</div>
              <h3 className="text-lg font-semibold mb-2">Happy Users</h3>
              <p className="text-slate-400">Trusted by Kenyans nationwide</p>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-pink-400 mb-4">24/7</div>
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <p className="text-slate-400">Always here to help you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
