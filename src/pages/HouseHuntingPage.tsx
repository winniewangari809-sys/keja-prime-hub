import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
  "Single Room",
  "Bedsitter",
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4 Bedroom",
  "Maisonette",
  "Penthouse",
];

const AMENITIES = [
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "water", label: "Water" },
  { id: "wifi", label: "WiFi" },
  { id: "furnished", label: "Furnished" },
  { id: "balcony", label: "Balcony" },
  { id: "gym", label: "Gym" },
  { id: "swimming_pool", label: "Swimming Pool" },
  { id: "pets_allowed", label: "Pets Allowed" },
];

interface FormData {
  name: string;
  phone: string;
  email: string;
  area: string;
  budget_min: string;
  budget_max: string;
  property_type: string;
  move_in_date: string;
  amenities: string[];
}

export default function HouseHuntingPage() {
  const navigate = useNavigate();
  const { user, firstName } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: user?.email || "",
    area: "",
    budget_min: "",
    budget_max: "",
    property_type: "",
    move_in_date: "",
    amenities: [],
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, property_type: value }));
  };

  const handleAmenityChange = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.area ||
      !formData.budget_min ||
      !formData.budget_max ||
      !formData.property_type ||
      !formData.move_in_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("house_hunting_requests").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        area: formData.area,
        budget_min: parseInt(formData.budget_min),
        budget_max: parseInt(formData.budget_max),
        property_type: formData.property_type,
        move_in_date: formData.move_in_date,
        amenities: formData.amenities,
      });

      if (error) {
        toast.error("Failed to submit request");
      } else {
        toast.success("House hunting request submitted successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-app py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Find Your Perfect Home</CardTitle>
            <CardDescription>
              Let our concierge team help you find the ideal property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 700 000000"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Property Preferences */}
              <div>
                <h3 className="font-semibold mb-4">Property Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area/Location *</Label>
                    <Input
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="e.g., Nairobi, Westlands"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={handlePropertyTypeChange}
                      disabled={loading}
                    >
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budgetMin">Minimum Budget (KES) *</Label>
                    <Input
                      id="budgetMin"
                      name="budget_min"
                      type="number"
                      value={formData.budget_min}
                      onChange={handleInputChange}
                      placeholder="0"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax">Maximum Budget (KES) *</Label>
                    <Input
                      id="budgetMax"
                      name="budget_max"
                      type="number"
                      value={formData.budget_max}
                      onChange={handleInputChange}
                      placeholder="0"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="moveInDate">Move-in Date *</Label>
                    <Input
                      id="moveInDate"
                      name="move_in_date"
                      type="date"
                      value={formData.move_in_date}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold mb-4">Desired Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={formData.amenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityChange(amenity.id)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={amenity.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
