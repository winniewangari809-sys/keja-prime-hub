import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sofa, Calendar, Users, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const AirbnbPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    check_in: "",
    check_out: "",
    guests: "1",
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .ilike("property_type", "%airbnb%");

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      toast.error("Failed to load Airbnb listings");
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const check_in_date = new Date(checkIn);
    const check_out_date = new Date(checkOut);
    const diffTime = Math.abs(check_out_date.getTime() - check_in_date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    if (!selectedListing || !bookingData.check_in || !bookingData.check_out) {
      return 0;
    }
    const nights = calculateNights(bookingData.check_in, bookingData.check_out);
    return (selectedListing.price || 0) * nights;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.check_in || !bookingData.check_out || !bookingData.guests) {
      toast.error("Please fill in all booking details");
      return;
    }

    if (new Date(bookingData.check_in) >= new Date(bookingData.check_out)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setBookingLoading(true);
    try {
      const { error } = await supabase.from("airbnb_bookings").insert({
        property_id: selectedListing.id,
        user_id: user?.id || null,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: parseInt(bookingData.guests),
        total_price: calculateTotal(),
      });

      if (error) throw error;
      toast.success("Booking submitted successfully!");
      setBookingDialogOpen(false);
      setBookingData({ check_in: "", check_out: "", guests: "1" });
    } catch (err) {
      toast.error("Failed to submit booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-app">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Airbnb Stays</h1>
          <p className="text-lg text-slate-600">
            Book short-term accommodations across Kenya
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sofa className="mb-4 h-12 w-12 text-slate-400" />
              <p className="text-center text-slate-600">No Airbnb listings available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden transition-all hover:shadow-lg">
                {/* Listing Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <Sofa className="h-16 w-16 text-slate-400" />
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {formatPrice(listing.price || 0)}
                    </span>
                    <span className="text-sm text-slate-600">per night</span>
                  </div>

                  <Separator />

                  {/* Property Details */}
                  <div className="grid grid-cols-3 gap-4">
                    {listing.bedrooms && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          {listing.bedrooms}
                        </p>
                        <p className="text-xs text-slate-600">Bedrooms</p>
                      </div>
                    )}
                    {listing.bathrooms && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          {listing.bathrooms}
                        </p>
                        <p className="text-xs text-slate-600">Bathrooms</p>
                      </div>
                    )}
                    {listing.square_feet && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          {listing.square_feet}
                        </p>
                        <p className="text-xs text-slate-600">sqft</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <>
                      <Separator />
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {listing.description}
                      </p>
                    </>
                  )}

                  {/* Booking Dialog */}
                  <Dialog open={bookingDialogOpen && selectedListing?.id === listing.id} onOpenChange={(open) => {
                    setBookingDialogOpen(open);
                    if (open) setSelectedListing(listing);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedListing(listing);
                          setBookingDialogOpen(true);
                        }}
                      >
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book {listing.title}</DialogTitle>
                        <DialogDescription>
                          Complete your booking for this Airbnb
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleBooking} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="check_in">Check-In Date</Label>
                          <Input
                            id="check_in"
                            type="date"
                            value={bookingData.check_in}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                check_in: e.target.value,
                              }))
                            }
                            disabled={bookingLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="check_out">Check-Out Date</Label>
                          <Input
                            id="check_out"
                            type="date"
                            value={bookingData.check_out}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                check_out: e.target.value,
                              }))
                            }
                            disabled={bookingLoading}
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
                              setBookingData((prev) => ({
                                ...prev,
                                guests: e.target.value,
                              }))
                            }
                            disabled={bookingLoading}
                          />
                        </div>

                        {bookingData.check_in && bookingData.check_out && (
                          <div className="rounded-lg bg-slate-50 p-4">
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                {calculateNights(bookingData.check_in, bookingData.check_out)} nights
                              </span>
                              <span className="text-slate-600">
                                {formatPrice((listing.price || 0) * calculateNights(bookingData.check_in, bookingData.check_out))}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>{formatPrice(calculateTotal())}</span>
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBookingDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={bookingLoading}>
                            {bookingLoading ? "Booking..." : "Confirm Booking"}
                          </Button>
                        </DialogFooter>
                      </form>
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
};
