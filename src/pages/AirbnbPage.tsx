import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, DollarSign } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  property_type: string;
  bedrooms?: number;
}

interface BookingFormData {
  check_in: string;
  check_out: string;
  guests: string;
}

export default function AirbnbPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    check_in: "",
    check_out: "",
    guests: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, price, location, property_type, bedrooms")
        .ilike("property_type", "%airbnb%")
        .limit(20);

      if (error) {
        toast.error("Failed to fetch listings");
      } else {
        setProperties(data || []);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () => {
    if (!selectedProperty || !bookingData.check_in || !bookingData.check_out) return 0;

    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights * selectedProperty.price : 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty || !bookingData.check_in || !bookingData.check_out || !bookingData.guests) {
      toast.error("Please fill in all booking details");
      return;
    }

    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setSubmitting(true);
    try {
      const totalPrice = calculateTotalPrice();

      const { error } = await supabase.from("airbnb_bookings").insert({
        property_id: selectedProperty.id,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: parseInt(bookingData.guests),
        total_price: totalPrice,
      });

      if (error) {
        toast.error("Failed to create booking");
      } else {
        toast.success("Booking created successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container-app py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold mb-2">Airbnb Stays</h1>
        <p className="text-gray-600 mb-8">Book your next short-term stay in Kenya</p>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">No Airbnb listings available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Dialog key={property.id}>
                <DialogTrigger asChild>
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{formatPrice(property.price)}</span>
                        <span className="text-sm text-gray-600">/night</span>
                      </div>
                      {property.bedrooms && (
                        <p className="text-sm text-gray-600">{property.bedrooms} bedrooms</p>
                      )}
                      <Badge variant="outline">{property.property_type}</Badge>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book {property.title}</DialogTitle>
                    <DialogDescription>{property.location}</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <Label htmlFor="checkIn">Check-in Date *</Label>
                      <Input
                        id="checkIn"
                        name="check_in"
                        type="date"
                        value={bookingData.check_in}
                        onChange={handleInputChange}
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="checkOut">Check-out Date *</Label>
                      <Input
                        id="checkOut"
                        name="check_out"
                        type="date"
                        value={bookingData.check_out}
                        onChange={handleInputChange}
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="guests">Number of Guests *</Label>
                      <Input
                        id="guests"
                        name="guests"
                        type="number"
                        value={bookingData.guests}
                        onChange={handleInputChange}
                        placeholder="1"
                        disabled={submitting}
                        required
                        min="1"
                      />
                    </div>

                    {bookingData.check_in && bookingData.check_out && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Estimated Total</p>
                        <p className="text-2xl font-bold">{formatPrice(calculateTotalPrice())}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.ceil(
                            (new Date(bookingData.check_out).getTime() -
                              new Date(bookingData.check_in).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          nights
                        </p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Booking..." : "Complete Booking"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
