import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/house-hunting")({
  component: HouseHuntingComponent,
});

interface FormData {
  name: string;
  phone: string;
  email: string;
  area: string;
  budget_min: string;
  budget_max: string;
  property_type: string;
  move_in_date: string;
}

const amenities = [
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

function HouseHuntingComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    area: "",
    budget_min: "",
    budget_max: "",
    property_type: "",
    move_in_date: "",
  });

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.area.trim()) {
      toast.error("Area/Location is required");
      return false;
    }
    if (!formData.budget_min || !formData.budget_max) {
      toast.error("Budget range is required");
      return false;
    }
    if (parseInt(formData.budget_min) > parseInt(formData.budget_max)) {
      toast.error("Minimum budget must be less than maximum budget");
      return false;
    }
    if (!formData.property_type) {
      toast.error("Property type is required");
      return false;
    }
    if (!formData.move_in_date) {
      toast.error("Move-in date is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("house_hunting_requests")
        .insert([
          {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            area: formData.area,
            budget_min: parseInt(formData.budget_min),
            budget_max: parseInt(formData.budget_max),
            property_type: formData.property_type,
            move_in_date: formData.move_in_date,
            amenities: selectedAmenities,
          },
        ]);

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("House hunting request submitted successfully!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error("An error occurred while submitting your request");
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">House Hunting Concierge</CardTitle>
            <CardDescription>
              Tell us what you're looking for and our expert team will help you find the perfect property
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 700 000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Property Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Property Preferences
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="area">Preferred Area/Location</Label>
                  <Input
                    id="area"
                    type="text"
                    placeholder="e.g., Nairobi, Mombasa, Kisumu"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Minimum Budget (KES)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      placeholder="e.g., 50000"
                      value={formData.budget_min}
                      onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Maximum Budget (KES)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      placeholder="e.g., 200000"
                      value={formData.budget_max}
                      onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                      <SelectTrigger id="property_type" disabled={loading}>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="bedsitter">Bedsitter</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="bungalow">Bungalow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="move_in_date">Desired Move-in Date</Label>
                    <Input
                      id="move_in_date"
                      type="date"
                      value={formData.move_in_date}
                      onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Desired Amenities
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={selectedAmenities.includes(amenity.id)}
                        onCheckedChange={() => toggleAmenity(amenity.id)}
                        disabled={loading}
                      />
                      <Label htmlFor={amenity.id} className="cursor-pointer font-normal">
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Submitting..." : "Submit House Hunting Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
