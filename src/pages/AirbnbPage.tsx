import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, MapPin, Users } from "lucide-react";

interface AirbnbListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  image_url?: string;
}

export const AirbnbPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<AirbnbListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .ilike("property_type", "%airbnb%");

      if (error) {
        toast.error("Failed to fetch listings");
        setLoading(false);
        return;
      }

      setListings((data as AirbnbListing[]) || []);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = (): number => {
    if (!selectedProperty) return 0;
    const property = listings.find((p) => p.id === selectedProperty);
    if (!property) return 0;
    return property.price * calculateNights();
  };

  const validateForm = () => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return false;
    }
    if (!checkIn) {
      toast.error("Check-in date is required");
      return false;
    }
    if (!checkOut) {
      toast.error("Check-out date is required");
      return false;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error("Check-out date must be after check-in date");
      return false;
    }
    if (!guests || parseInt(guests) < 1) {
      toast.error("Number of guests must be at least 1");
      return false;
    }
    return true;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setBookingLoading(true);
    try {
      const { error } = await supabase.from("airbnb_bookings").insert({
        property_id: selectedProperty,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
        total_price: calculateTotal(),
      });

      if (error) {
        toast.error("Failed to create booking");
        setBookingLoading(false);
        return;
      }

      toast.success("Booking created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(price);
  };

  const nights = calculateNights();
  const total = calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading Airbnb listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-app mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Airbnb Listings</h1>
          <p className="text-gray-600 mt-2">Book short-term stays across Kenya</p>
        </div>

        {listings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600">No Airbnb listings available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Listings */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProperty === listing.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => {
                      setSelectedProperty(listing.id);
                      setShowBookingForm(true);
                    }}
                  >
                    {listing.image_url && (
                      <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg">
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {listing.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        {listing.location}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{listing.bedrooms} Bedrooms</span>
                        <span>{listing.bathrooms} Bathrooms</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(listing.price)}
                        <span className="text-sm text-gray-600"> / night</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            {showBookingForm && selectedProperty && (
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Book Now</CardTitle>
                    <CardDescription>
                      {listings.find((p) => p.id === selectedProperty)?.title}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleBooking}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn">Check-in Date</Label>
                        <Input
                          id="checkIn"
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
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
                          disabled={bookingLoading}
                        />
                      </div>

                      {/* Price Breakdown */}
                      {nights > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {formatPrice(
                                listings.find((p) => p.id === selectedProperty)?.price || 0
                              )}{" "}
                              × {nights} nights
                            </span>
                            <span className="font-semibold">
                              {formatPrice(total)}
                            </span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">{formatPrice(total)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={bookingLoading}>
                        {bookingLoading ? "Booking..." : "Complete Booking"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
