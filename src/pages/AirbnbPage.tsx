import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Users, DollarSign } from "lucide-react";

interface AirbnbProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
}

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  guests: string;
}

export const AirbnbPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<AirbnbProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<AirbnbProperty | null>(null);

  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, description, price, location, bedrooms, bathrooms")
        .ilike("property_type", "%airbnb%");

      if (error) {
        toast.error("Failed to load properties");
      } else {
        setProperties(data as AirbnbProperty[]);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = (): number => {
    if (!selectedProperty) return 0;
    const days = calculateDays(bookingForm.checkIn, bookingForm.checkOut);
    return days > 0 ? selectedProperty.price * days : 0;
  };

  const validateBooking = () => {
    const newErrors: Record<string, string> = {};

    if (!bookingForm.checkIn) newErrors.checkIn = "Check-in date is required";
    if (!bookingForm.checkOut) newErrors.checkOut = "Check-out date is required";
    if (!bookingForm.guests) newErrors.guests = "Number of guests is required";

    if (bookingForm.checkIn && bookingForm.checkOut) {
      const checkInDate = new Date(bookingForm.checkIn);
      const checkOutDate = new Date(bookingForm.checkOut);
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Check-out date must be after check-in date";
      }
    }

    const guests = parseInt(bookingForm.guests);
    if (guests < 1) newErrors.guests = "At least 1 guest is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty || !validateBooking()) return;

    setSubmitting(true);
    try {
      const days = calculateDays(bookingForm.checkIn, bookingForm.checkOut);
      const totalPrice = selectedProperty.price * days;

      const { error } = await supabase.from("airbnb_bookings").insert({
        property_id: selectedProperty.id,
        check_in: bookingForm.checkIn,
        check_out: bookingForm.checkOut,
        guests: parseInt(bookingForm.guests),
        total_price: totalPrice,
        user_id: user?.id || null,
      });

      if (error) {
        toast.error(error.message || "Failed to create booking");
      } else {
        toast.success("Booking confirmed! Check your email for details.");
        setSelectedProperty(null);
        setBookingForm({ checkIn: "", checkOut: "", guests: "" });
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Airbnb Properties</h1>
        <p className="text-gray-600 mb-8">Book your next vacation stay</p>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="pt-8">
              <p className="text-center text-gray-600">No Airbnb properties available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Properties List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((prop) => (
                  <Card
                    key={prop.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProperty?.id === prop.id ? "ring-2 ring-purple-600" : ""
                    }`}
                    onClick={() => setSelectedProperty(prop)}
                  >
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{prop.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{prop.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{prop.location}</span>
                      </div>

                      <div className="flex gap-4">
                        {prop.bedrooms !== undefined && (
                          <div className="text-sm">
                            <p className="font-semibold">{prop.bedrooms}</p>
                            <p className="text-gray-600">Bedroom{prop.bedrooms !== 1 ? "s" : ""}</p>
                          </div>
                        )}
                        {prop.bathrooms !== undefined && (
                          <div className="text-sm">
                            <p className="font-semibold">{prop.bathrooms}</p>
                            <p className="text-gray-600">Bathroom{prop.bathrooms !== 1 ? "s" : ""}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-2xl font-bold text-purple-600">
                          KES {prop.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">per night</p>
                      </div>

                      {selectedProperty?.id === prop.id && (
                        <div className="pt-2">
                          <p className="text-sm font-semibold text-purple-600">✓ Selected</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            {selectedProperty ? (
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Book This Property</CardTitle>
                    <CardDescription>{selectedProperty.title}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn">Check-in Date *</Label>
                        <Input
                          id="checkIn"
                          type="date"
                          value={bookingForm.checkIn}
                          onChange={(e) => {
                            setBookingForm({ ...bookingForm, checkIn: e.target.value });
                            if (errors.checkIn) setErrors({ ...errors, checkIn: undefined });
                          }}
                          className={errors.checkIn ? "border-red-500" : ""}
                        />
                        {errors.checkIn && <p className="text-sm text-red-500">{errors.checkIn}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="checkOut">Check-out Date *</Label>
                        <Input
                          id="checkOut"
                          type="date"
                          value={bookingForm.checkOut}
                          onChange={(e) => {
                            setBookingForm({ ...bookingForm, checkOut: e.target.value });
                            if (errors.checkOut) setErrors({ ...errors, checkOut: undefined });
                          }}
                          className={errors.checkOut ? "border-red-500" : ""}
                        />
                        {errors.checkOut && <p className="text-sm text-red-500">{errors.checkOut}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guests">Number of Guests *</Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          value={bookingForm.guests}
                          onChange={(e) => {
                            setBookingForm({ ...bookingForm, guests: e.target.value });
                            if (errors.guests) setErrors({ ...errors, guests: undefined });
                          }}
                          className={errors.guests ? "border-red-500" : ""}
                        />
                        {errors.guests && <p className="text-sm text-red-500">{errors.guests}</p>}
                      </div>

                      {bookingForm.checkIn && bookingForm.checkOut && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <p className="text-gray-600">
                              {calculateDays(bookingForm.checkIn, bookingForm.checkOut)} nights
                            </p>
                            <p className="font-semibold">
                              KES {selectedProperty.price.toLocaleString()}/night
                            </p>
                          </div>
                          <div className="border-t pt-2 flex justify-between items-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <p className="text-xl font-bold text-green-600">
                              KES {calculateTotal().toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <Button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700">
                        {submitting ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-8">
                  <p className="text-center text-gray-600">Select a property to book</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
