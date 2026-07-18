import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, MapPin, Bed, Bath, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  image_url: string;
}

export const RentalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const filtered = properties.filter((prop) => {
      const query = searchQuery.toLowerCase();
      return (
        prop.title.toLowerCase().includes(query) ||
        prop.location.toLowerCase().includes(query) ||
        prop.description.toLowerCase().includes(query)
      );
    });
    setFilteredProperties(filtered);
  }, [searchQuery, properties]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .neq('property_type', 'airbnb')
        .limit(50);

      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-app h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">KejaHub - Rentals</h1>
          <Button
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-slate-600 bg-slate-800 text-white placeholder:text-slate-400 py-6 px-4 text-base"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-slate-400 text-sm">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'No properties found' : 'No properties available'}
            </h2>
            <p className="text-slate-400 mb-6">
              {searchQuery
                ? `We couldn't find any properties matching "${searchQuery}". Try a different search.`
                : 'Check back soon for available listings'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                className="border-slate-700 bg-slate-800 overflow-hidden hover:border-slate-600 transition-colors cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
              >
                {property.image_url && (
                  <div className="w-full h-48 bg-slate-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white flex-1">{property.title}</h3>
                    <Badge className="bg-blue-600 ml-2">{property.property_type}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{property.description}</p>

                  {/* Property Features */}
                  <div className="flex gap-4 mb-4 py-3 border-y border-slate-700">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms || 'N/A'} bed{(property.bedrooms || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms || 'N/A'} bath{(property.bathrooms || 0) > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-white">{formatPrice(property.price)}</span>
                      <span className="text-slate-400 text-sm ml-1">/month</span>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredProperties.length > 0 && filteredProperties.length < properties.length && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
              onClick={() => {
                // In a real app, this would load more properties
                toast.info('More properties coming soon');
              }}
            >
              Load More Properties
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
