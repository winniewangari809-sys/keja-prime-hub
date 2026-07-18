import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  image_url?: string;
}

export default function AirbnbPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Property | null>(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or("property_type.eq.'airbnb',property_type.ilike.'%airbnb%'")
        .eq('status', 'available');

      if (error) {
        toast.error('Failed to fetch listings');
        console.error(error);
        return;
      }

      setListings(data || []);
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    if (!selectedListing) return 0;
    return calculateNights() * selectedListing.price;
  };

  const handleBooking = async () => {
    if (!selectedListing || !user) {
      toast.error('Please select a listing and ensure you are logged in');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (calculateNights() <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      const { error } = await supabase.from('airbnb_bookings').insert({
        requester_id: user.id,
        property_id: selectedListing.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: parseInt(bookingData.guests),
        total_price: calculateTotal(),
      });

      if (error) {
        toast.error('Failed to create booking');
        console.error(error);
        return;
      }

      toast.success('Booking created successfully!');
      setSelectedListing(null);
      setBookingData({
        checkIn: '',
        checkOut: '',
        guests: '1',
      });
      navigate('/dashboard');
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-slate-900">Airbnb Listings</h1>
            <p className="text-slate-600 mt-1">Find and book amazing vacation rentals</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No listings available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {listing.image_url && (
                  <div className="w-full h-48 bg-slate-200 overflow-hidden">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">
                      {listing.title}
                    </h3>
                    <Badge variant="secondary">
                      <Star className="w-3 h-3 mr-1" />
                      4.8
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{listing.location}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span>{listing.bedrooms} Bedrooms</span>
                      <span>{listing.bathrooms} Bathrooms</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-slate-900">
                      KES {listing.price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-600">/night</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedListing(listing)}
                        className="w-full"
                      >
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book {listing.title}</DialogTitle>
                        <DialogDescription>
                          KES {listing.price?.toLocaleString()} per night
                        </DialogDescription>
                      </DialogHeader>
                      {selectedListing?.id === listing.id && (
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="checkIn">Check-in Date</Label>
                            <Input
                              id="checkIn"
                              type="date"
                              value={bookingData.checkIn}
                              onChange={(e) =>
                                setBookingData({
                                  ...bookingData,
                                  checkIn: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checkOut">Check-out Date</Label>
                            <Input
                              id="checkOut"
                              type="date"
                              value={bookingData.checkOut}
                              onChange={(e) =>
                                setBookingData({
                                  ...bookingData,
                                  checkOut: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guests">Number of Guests</Label>
                            <Input
                              id="guests"
                              type="number"
                              min="1"
                              value={bookingData.guests}
                              onChange={(e) =>
                                setBookingData({
                                  ...bookingData,
                                  guests: e.target.value,
                                })
                              }
                            />
                          </div>
                          {calculateNights() > 0 && (
                            <div className="bg-slate-100 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Nights:</span>
                                <span className="font-semibold">{calculateNights()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Price per night:</span>
                                <span className="font-semibold">
                                  KES {listing.price?.toLocaleString()}
                                </span>
                              </div>
                              <div className="border-t border-slate-300 pt-2 flex justify-between">
                                <span>Total:</span>
                                <span className="font-bold text-lg">
                                  KES {calculateTotal()?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button
                          onClick={handleBooking}
                          disabled={calculateNights() <= 0}
                        >
                          Confirm Booking
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
