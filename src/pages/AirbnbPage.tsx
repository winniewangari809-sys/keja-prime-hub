import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  image_url: string;
  rating: number;
  reviews: number;
}

export const AirbnbPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAirbnbProperties();
  }, []);

  const fetchAirbnbProperties = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .ilike('property_type', '%airbnb%')
        .limit(20);

      setProperties(data || []);
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

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(nights, 0);
  };

  const nights = calculateNights();
  const totalPrice = selectedProperty ? nights * selectedProperty.price : 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty) {
      toast.error('Please select a property');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!guests || parseInt(guests) <= 0) {
      toast.error('Please enter number of guests');
      return;
    }

    setBookingLoading(true);
    try {
      const { error } = await supabase.from('airbnb_bookings').insert([
        {
          user_id: user?.id,
          property_id: selectedProperty.id,
          check_in: checkIn,
          check_out: checkOut,
          guests: parseInt(guests),
          total_price: totalPrice,
        },
      ]);

      if (error) {
        toast.error('Failed to create booking');
      } else {
        toast.success('Booking created successfully!');
        setDialogOpen(false);
        setCheckIn('');
        setCheckOut('');
        setGuests('1');
        setSelectedProperty(null);
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setBookingLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-white">KejaHub - Airbnb Stays</h1>
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
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">No properties available</h2>
            <p className="text-slate-400">Check back soon for available listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="border-slate-700 bg-slate-800 overflow-hidden hover:border-slate-600 transition-colors">
                {property.image_url && (
                  <div className="w-full h-48 bg-slate-700 flex items-center justify-center">
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{property.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>

                  {property.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(property.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-400">
                        {property.rating} ({property.reviews} reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{property.description}</p>

                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">{formatPrice(property.price)}</span>
                    <span className="text-slate-400 text-sm">per night</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Dialog open={dialogOpen && selectedProperty?.id === property.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedProperty(property);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Book Now</Button>
                    </DialogTrigger>
                    <DialogContent className="border-slate-700 bg-slate-800">
                      <DialogHeader>
                        <DialogTitle>Book {property.title}</DialogTitle>
                        <DialogDescription>
                          Select your dates and number of guests
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleBooking}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="checkIn">Check-in Date</Label>
                            <Input
                              id="checkIn"
                              type="date"
                              value={checkIn}
                              onChange={(e) => setCheckIn(e.target.value)}
                              className="border-slate-600 bg-slate-700 text-white"
                              disabled={bookingLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="checkOut">Check-out Date</Label>
                            <Input
                              id="checkOut"
                              type="date"
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="border-slate-600 bg-slate-700 text-white"
                              disabled={bookingLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="guests">Number of Guests</Label>
                            <Input
                              id="guests"
                              type="number"
                              min="1"
                              value={guests}
                              onChange={(e) => setGuests(e.target.value)}
                              className="border-slate-600 bg-slate-700 text-white"
                              disabled={bookingLoading}
                            />
                          </div>

                          {nights > 0 && (
                            <div className="bg-slate-700 rounded p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{nights} nights</span>
                                <span className="text-white">{formatPrice(property.price)}/night</span>
                              </div>
                              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                                <span className="text-white">Total</span>
                                <span className="text-blue-400">{formatPrice(totalPrice)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter className="gap-2">
                          <DialogClose asChild>
                            <Button variant="outline" className="border-slate-600" disabled={bookingLoading}>
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={bookingLoading || nights <= 0}
                          >
                            {bookingLoading ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Booking...
                              </>
                            ) : (
                              'Confirm Booking'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
