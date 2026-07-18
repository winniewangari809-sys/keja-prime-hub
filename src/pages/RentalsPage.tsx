import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  image_url?: string;
  phone?: string;
  email?: string;
}

export default function RentalsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchQuery, properties]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('property_type', [
          'Single Room',
          'Bedsitter',
          'Studio',
          '1 Bedroom',
          '2 Bedroom',
          '3 Bedroom',
          '4 Bedroom',
          'Maisonette',
          'Penthouse',
        ])
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch properties');
        console.error(error);
        return;
      }

      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    if (!searchQuery.trim()) {
      setFilteredProperties(properties);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = properties.filter((property) =>
      property.title.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query)
    );

    setFilteredProperties(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Single Room': 'bg-blue-100 text-blue-800',
      'Bedsitter': 'bg-purple-100 text-purple-800',
      'Studio': 'bg-pink-100 text-pink-800',
      '1 Bedroom': 'bg-green-100 text-green-800',
      '2 Bedroom': 'bg-indigo-100 text-indigo-800',
      '3 Bedroom': 'bg-cyan-100 text-cyan-800',
      '4 Bedroom': 'bg-orange-100 text-orange-800',
      'Maisonette': 'bg-amber-100 text-amber-800',
      'Penthouse': 'bg-rose-100 text-rose-800',
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading rentals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-slate-900">Rental Properties</h1>
            <p className="text-slate-600 mt-1">Browse available apartments and houses</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search by location or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <p className="text-sm text-slate-600 mt-2">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              {searchQuery
                ? 'No properties match your search'
                : 'No rental properties available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {/* Image */}
                {property.image_url && (
                  <div className="w-full h-48 bg-slate-200 overflow-hidden">
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Content */}
                <CardContent className="p-4 flex-1 flex flex-col">
                  {/* Type Badge */}
                  <div className="mb-2">
                    <Badge className={getPropertyTypeColor(property.property_type)}>
                      {property.property_type}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {property.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-slate-900 mb-3">
                    {formatPrice(property.price)}
                    <span className="text-sm text-slate-600 font-normal">/month</span>
                  </div>

                  {/* Features */}
                  <div className="flex gap-4 text-sm text-slate-600 mb-4">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.bedrooms} Beds
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.bathrooms} Baths
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mt-auto pt-4 border-t border-slate-200">
                    {property.phone && (
                      <a
                        href={`tel:${property.phone}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Phone className="w-4 h-4" />
                        {property.phone}
                      </a>
                    )}
                    {property.email && (
                      <a
                        href={`mailto:${property.email}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Mail className="w-4 h-4" />
                        {property.email}
                      </a>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full mt-4">Inquire Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
