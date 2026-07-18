import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/airbnb")({
  component: AirbnbComponent,
});

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

interface BookingForm {
  check_in: string;
  check_out: string;
  guests: string;
}

function AirbnbComponent() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    check_in: "",
    check_out: "",
    guests: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("property_type", "airbnb")
        .eq("status", "active");

      if (error) {
        toast.error("Failed to load properties");
        setLoading(false);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      toast.error("An error occurred while fetching properties");
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingForm.check_in || !bookingForm.check_out) return 0;
    const checkIn = new Date(bookingForm.check_in);
    const checkOut = new Date(bookingForm.check_out);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    if (!selectedProperty) return 0;
    return selectedProperty.price * calculateNights();
  };

  const validateBooking = () => {
    if (!bookingForm.check_in) {
      toast.error("Check-in date is required");
      return false;
    }
    if (!bookingForm.check_out) {
      toast.error("Check-out date is required");
      return false;
    }
    if (!bookingForm.guests) {
      toast.error("Number of guests is required");
      return false;
    }
    if (parseInt(bookingForm.guests) < 1) {
      toast.error("At least 1 guest is required");
      return false;
    }
    if (new Date(bookingForm.check_in) >= new Date(bookingForm.check_out)) {
      toast.error("Check-out date must be after check-in date");
      return false;
    }
    return true;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBooking() || !selectedProperty) return;

    setBookingLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to make a booking");
        navigate({ to: "/login" });
        setBookingLoading(false);
        return;
      }

      const { error } = await supabase
        .from("airbnb_bookings")
        .insert([
          {
            property_id: selectedProperty.id,
            user_id: user.id,
            check_in_date: bookingForm.check_in,
            check_out_date: bookingForm.check_out,
            guests: parseInt(bookingForm.guests),
            total_price: calculateTotal(),
            status: "confirmed",
          },
        ]);

      if (error) {
        toast.error(error.message);
        setBookingLoading(false);
        return;
      }

      toast.success(
        `Booking confirmed! Total: KES ${calculateTotal().toLocaleString()}`
      );
      setSelectedProperty(null);
      setBookingForm({ check_in: "", check_out: "", guests: "" });
    } catch (error) {
      toast.error("An error occurred while creating your booking");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Vacation Rentals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Book your perfect Airbnb property across Kenya
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No Airbnb properties available at the moment
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{property.title}</CardTitle>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <CardDescription className="line-clamp-1">
                      {property.location}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="text-2xl font-bold text-blue-600">
                    KES {property.price.toLocaleString()}
                    <span className="text-sm text-gray-600 dark:text-gray-400">/night</span>
                  </div>

                  {/* Details */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  </div>

                  {/* Booking Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedProperty(property)}
                      >
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book {property.title}</DialogTitle>
                        <DialogDescription>
                          Fill in your booking details below
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleBooking} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="check_in">Check-in Date</Label>
                          <Input
                            id="check_in"
                            type="date"
                            value={bookingForm.check_in}
                            onChange={(e) =>
                              setBookingForm({ ...bookingForm, check_in: e.target.value })
                            }
                            disabled={bookingLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="check_out">Check-out Date</Label>
                          <Input
                            id="check_out"
                            type="date"
                            value={bookingForm.check_out}
                            onChange={(e) =>
                              setBookingForm({ ...bookingForm, check_out: e.target.value })
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
                            placeholder="Enter number of guests"
                            value={bookingForm.guests}
                            onChange={(e) =>
                              setBookingForm({ ...bookingForm, guests: e.target.value })
                            }
                            disabled={bookingLoading}
                          />
                        </div>

                        {/* Summary */}
                        {bookingForm.check_in && bookingForm.check_out && calculateNights() > 0 && (
                          <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Nights:</span>
                              <span className="font-semibold">{calculateNights()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Price per night:</span>
                              <span className="font-semibold">
                                KES {property.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between">
                              <span className="font-semibold">Total:</span>
                              <span className="text-lg font-bold text-blue-600">
                                KES {calculateTotal().toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={bookingLoading}
                          className="w-full"
                        >
                          {bookingLoading ? "Booking..." : "Confirm Booking"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
