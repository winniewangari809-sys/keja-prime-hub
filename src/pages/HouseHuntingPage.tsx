import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

export const HouseHuntingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
    area: "",
    budget_min: "",
    budget_max: "",
    property_type: "",
    move_in_date: "",
  });

  const [amenities, setAmenities] = useState({
    parking: false,
    security: false,
    water: false,
    wifi: false,
    furnished: false,
    balcony: false,
    gym: false,
    swimming_pool: false,
    pets_allowed: false,
  });

  const propertyTypes = [
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

  const amenityOptions = [
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

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setAmenities((prev) => ({
      ...prev,
      [amenity]: checked,
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
        amenities: JSON.stringify(amenities),
        user_id: user?.id || null,
      });

      if (error) throw error;
      toast.success("House hunting request submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to submit house hunting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">House Hunting Concierge</h1>
          <p className="mt-2 text-lg text-slate-600">
            Tell us what you're looking for and our concierge team will find your perfect home
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>House Hunting Request</CardTitle>
                <CardDescription>
                  Fill out this form to get personalized assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleFormChange("name", e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+254712345678"
                          value={formData.phone}
                          onChange={(e) => handleFormChange("phone", e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Property Preferences</h3>
                    <div className="space-y-2">
                      <Label htmlFor="area">Preferred Area *</Label>
                      <Input
                        id="area"
                        placeholder="e.g., Westlands, Kilimani, Karen"
                        value={formData.area}
                        onChange={(e) => handleFormChange("area", e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="budget_min">Minimum Budget (KES) *</Label>
                        <Input
                          id="budget_min"
                          type="number"
                          placeholder="50000"
                          value={formData.budget_min}
                          onChange={(e) => handleFormChange("budget_min", e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget_max">Maximum Budget (KES) *</Label>
                        <Input
                          id="budget_max"
                          type="number"
                          placeholder="200000"
                          value={formData.budget_max}
                          onChange={(e) => handleFormChange("budget_max", e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="property_type">Property Type *</Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(value) =>
                          handleFormChange("property_type", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger id="property_type">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="move_in_date">Move-In Date *</Label>
                      <Input
                        id="move_in_date"
                        type="date"
                        value={formData.move_in_date}
                        onChange={(e) => handleFormChange("move_in_date", e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Desired Amenities</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {amenityOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={amenities[option.id as keyof typeof amenities]}
                            onCheckedChange={(checked) =>
                              handleAmenityChange(option.id, checked as boolean)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={option.id} className="cursor-pointer">
                            {option.label}
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

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">1. Submit Request</p>
                  <p>Tell us your preferences and budget</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">2. Our Concierge Reaches Out</p>
                  <p>We'll contact you within 24 hours</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">3. Personalized Search</p>
                  <p>We find properties matching your needs</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">4. Schedule Viewings</p>
                  <p>View your top choices with guidance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Use Our Service?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>Personalized assistance from real estate experts</p>
                <p>Save time searching for the perfect home</p>
                <p>Access to exclusive properties</p>
                <p>Negotiation support and guidance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
