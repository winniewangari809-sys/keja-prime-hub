import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, DollarSign, Search } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  property_type: string;
  status: string;
}

export default function RentalsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchQuery, properties]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, price, location, bedrooms, bathrooms, property_type, status")
        .in("property_type", ["1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom", "Bedsitter", "Studio"])
        .eq("status", "available")
        .limit(50);

      if (error) {
        toast.error("Failed to fetch rentals");
      } else {
        setProperties(data || []);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    const query = searchQuery.toLowerCase();
    const filtered = properties.filter(
      (property) =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query)
    );
    setFilteredProperties(filtered);
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
          <p className="text-gray-600">Loading rentals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold mb-2">Rental Properties</h1>
        <p className="text-gray-600 mb-8">Browse available rental properties across Kenya</p>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by property name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-center py-8">
                {properties.length === 0
                  ? "No rental properties available at the moment"
                  : "No properties match your search"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{property.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{property.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatPrice(property.price)}</span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>

                  {/* Features */}
                  <div className="flex gap-4">
                    {property.bedrooms !== undefined && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{property.bedrooms} bed</span>
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{property.bathrooms} bath</span>
                      </div>
                    )}
                  </div>

                  {/* Property Type */}
                  <div>
                    <Badge variant="secondary">{property.property_type}</Badge>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full mt-4">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredProperties.length > 0 && (
          <p className="text-center text-gray-600 mt-8">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        )}
      </div>
    </div>
  );
}
