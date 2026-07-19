import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { MapPin, Bed, Bath, Square, Phone, Mail, Building2, Search } from "lucide-react";
import { toast } from "sonner";

export const RentalsPage = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchQuery, properties]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      toast.error("Failed to load rental properties");
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    const query = searchQuery.toLowerCase();
    const filtered = properties.filter(
      (prop) =>
        (prop.title && prop.title.toLowerCase().includes(query)) ||
        (prop.location && prop.location.toLowerCase().includes(query))
    );
    setFilteredProperties(filtered);
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const handleContactLandlord = (property: any) => {
    toast.info(`Contact landlord: ${property.contact_phone || "Not provided"}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-app">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Rental Properties</h1>
          <p className="text-lg text-slate-600">
            Discover rental properties available across Kenya
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by property name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-sm text-slate-600">
              {filteredProperties.length} properties found
            </p>
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading rental properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-slate-400" />
              <p className="text-center text-slate-600">
                {searchQuery
                  ? "No properties match your search"
                  : "No rental properties available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-slate-400" />
                  {property.admin_status === "approved" && (
                    <Badge className="absolute right-3 top-3 bg-green-600">
                      Available
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="text-2xl font-bold text-slate-900">
                    {formatPrice(property.price || 0)}
                  </div>

                  <Separator />

                  {/* Property Details */}
                  <div className="grid grid-cols-3 gap-4">
                    {property.bedrooms !== null && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Bed className="h-4 w-4 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-900">
                            {property.bedrooms}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600">Beds</p>
                      </div>
                    )}
                    {property.bathrooms !== null && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Bath className="h-4 w-4 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-900">
                            {property.bathrooms}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600">Baths</p>
                      </div>
                    )}
                    {property.square_feet && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Square className="h-4 w-4 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-900">
                            {property.square_feet}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600">sqft</p>
                      </div>
                    )}
                  </div>

                  {/* Property Type */}
                  {property.property_type && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-slate-600">Type</p>
                        <Badge variant="secondary" className="mt-1">
                          {property.property_type}
                        </Badge>
                      </div>
                    </>
                  )}

                  {/* Description */}
                  {property.description && (
                    <>
                      <Separator />
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {property.description}
                      </p>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog open={detailsDialogOpen && selectedProperty?.id === property.id} onOpenChange={(open) => {
                      setDetailsDialogOpen(open);
                      if (open) setSelectedProperty(property);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedProperty(property);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{property.title}</DialogTitle>
                          <DialogDescription>
                            {property.location}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Price</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                              {formatPrice(property.price || 0)}
                            </p>
                          </div>

                          {property.description && (
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Description
                              </p>
                              <p className="mt-1 text-slate-600">
                                {property.description}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-4">
                            {property.bedrooms !== null && (
                              <div className="text-center rounded-lg bg-slate-50 p-3">
                                <p className="text-sm font-semibold text-slate-900">
                                  {property.bedrooms}
                                </p>
                                <p className="text-xs text-slate-600">Bedrooms</p>
                              </div>
                            )}
                            {property.bathrooms !== null && (
                              <div className="text-center rounded-lg bg-slate-50 p-3">
                                <p className="text-sm font-semibold text-slate-900">
                                  {property.bathrooms}
                                </p>
                                <p className="text-xs text-slate-600">Bathrooms</p>
                              </div>
                            )}
                            {property.square_feet && (
                              <div className="text-center rounded-lg bg-slate-50 p-3">
                                <p className="text-sm font-semibold text-slate-900">
                                  {property.square_feet}
                                </p>
                                <p className="text-xs text-slate-600">sqft</p>
                              </div>
                            )}
                          </div>

                          {property.contact_phone && (
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Contact
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-600" />
                                <p className="text-slate-600">{property.contact_phone}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                          <Button
                            onClick={() => {
                              handleContactLandlord(property);
                              setDetailsDialogOpen(false);
                            }}
                          >
                            Contact Landlord
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      className="flex-1"
                      onClick={() => handleContactLandlord(property)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
