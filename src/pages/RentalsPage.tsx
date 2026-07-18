import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Bed, Bath, Home, Search } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

export const RentalsPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  // Filter properties when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = properties.filter(
        (prop) =>
          prop.title.toLowerCase().includes(term) ||
          prop.location.toLowerCase().includes(term) ||
          prop.description?.toLowerCase().includes(term)
      );
      setFilteredProperties(filtered);
    }
  }, [searchTerm, properties]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, description, price, location, bedrooms, bathrooms, property_type")
        .neq("property_type", "airbnb")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load properties");
      } else {
        setProperties(data as Property[]);
        setFilteredProperties(data as Property[]);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `KES ${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rental Properties</h1>
          <p className="text-gray-600 mb-6">Find apartments, houses, and more to rent across Kenya</p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              {searchTerm ? (
                <>
                  <p className="text-gray-600 mb-2">No properties found matching "{searchTerm}"</p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <p className="text-gray-600">No rental properties available at the moment</p>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Properties Grid */
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredProperties.length} of {properties.length} properties
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header with Property Type Badge */}
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 text-lg">{property.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {property.description || "No description available"}
                        </CardDescription>
                      </div>
                      {property.property_type && (
                        <Badge variant="outline" className="flex-shrink-0">
                          {property.property_type}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {/* Bedrooms and Bathrooms */}
                    <div className="flex gap-4">
                      {property.bedrooms !== null && property.bedrooms !== undefined && (
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {property.bedrooms} Bedroom{property.bedrooms !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {property.bathrooms !== null && property.bathrooms !== undefined && (
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {property.bathrooms} Bathroom{property.bathrooms !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {(!property.bedrooms && !property.bathrooms) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Home className="w-4 h-4" />
                          <span className="text-sm">Property details available upon inquiry</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </span>
                        <span className="text-sm text-gray-600">/ month</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
