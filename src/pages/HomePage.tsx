import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Building2, Hotel, Store } from 'lucide-react';

export const HomePage: React.FC = () => {
  const propertyTypes = [
    {
      id: 'rentals',
      title: 'Rentals',
      description: 'Find your next rental apartment or house',
      icon: Home,
      link: '/rentals',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'house-hunting',
      title: 'House Hunting',
      description: 'Looking to buy? We help you find the perfect home',
      icon: Building2,
      link: '/house-hunting',
      gradient: 'from-green-500 to-green-600',
    },
    {
      id: 'airbnb',
      title: 'Airbnb',
      description: 'Book your stay across Kenya',
      icon: Hotel,
      link: '/airbnb',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      id: 'commercial',
      title: 'Commercial',
      description: 'Grow your business with the right space',
      icon: Store,
      link: '/commercial',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-app h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">KejaHub</h1>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-app py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Find Your Perfect Home Across Kenya
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              KejaHub connects you with the best rental properties, homes for sale, vacation stays, and commercial spaces across Kenya. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/house-hunting" className="flex-1">
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Start Hunting
                </Button>
              </Link>
              <Link to="/rentals" className="flex-1">
                <Button size="lg" variant="outline" className="w-full border-slate-400 text-white hover:bg-slate-800">
                  Browse Rentals
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="container-app py-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">Explore Properties</h3>
          <p className="text-slate-400 text-lg">Choose what you're looking for</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link key={type.id} to={type.link}>
                <div className="group h-full bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-slate-600 transition-all hover:bg-slate-750 cursor-pointer">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${type.gradient} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {type.title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {type.description}
                  </p>
                  <div className="mt-4 inline-flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Explore
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-app py-24 border-t border-slate-700">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-12 md:p-16 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Space?
          </h3>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of Kenyans using KejaHub to find their ideal home or commercial space.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 bg-slate-900/50">
        <div className="container-app text-center text-slate-400">
          <p>&copy; 2026 KejaHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
