import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Bed, Bath, Home, Search } from "lucide-react";

interface Rental {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  description?: string;
  image_url?: string;
}

export const RentalsPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    filterRentals();
  }, [searchQuery, rentals]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("admin_status", "approved")
        .neq("property_type", "airbnb");

      if (error) {
        toast.error("Failed to fetch rentals");
        setLoading(false);
        return;
      }

      setRentals((data as Rental[]) || []);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    if (!searchQuery.trim()) {
      setFilteredRentals(rentals);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = rentals.filter(
      (rental) =>
        rental.title.toLowerCase().includes(query) ||
        rental.location.toLowerCase().includes(query)
    );
    setFilteredRentals(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading rental properties...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-app mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Rental Properties</h1>
          <p className="text-gray-600 mt-2">Explore available properties for rent across Kenya</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredRentals.length}</span> properties
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Rentals Grid */}
        {filteredRentals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {searchQuery
                  ? "No properties match your search"
                  : "No rental properties available at the moment"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.map((rental) => (
              <Card
                key={rental.id}
                className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full"
              >
                {/* Image */}
                {rental.image_url && (
                  <div className="w-full h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={rental.image_url}
                      alt={rental.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <CardHeader>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2">{rental.title}</CardTitle>
                    <Badge variant="outline" className="flex-shrink-0">
                      {rental.property_type}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {rental.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Location */}
                  <div className="flex items-center gap-2 mb-3 text-gray-600">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span className="text-sm">{rental.location}</span>
                  </div>

                  {/* Bedrooms & Bathrooms */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Bed size={16} />
                      <span>{rental.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Bath size={16} />
                      <span>{rental.bathrooms}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    {formatPrice(rental.price)}
                    <span className="text-sm text-gray-600 font-normal"> / month</span>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filter Summary */}
        {rentals.length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Property Types Available</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(rentals.map((r) => r.property_type))).map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    const filtered = rentals.filter((r) => r.property_type === type);
                    setFilteredRentals(filtered);
                    setSearchQuery("");
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
