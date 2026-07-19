import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const HouseHuntingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [area, setArea] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
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
  const [loading, setLoading] = useState(false);

  const propertyTypeOptions = [
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
    { key: "parking", label: "Parking" },
    { key: "security", label: "Security" },
    { key: "water", label: "Water" },
    { key: "wifi", label: "WiFi" },
    { key: "furnished", label: "Furnished" },
    { key: "balcony", label: "Balcony" },
    { key: "gym", label: "Gym" },
    { key: "swimming_pool", label: "Swimming Pool" },
    { key: "pets_allowed", label: "Pets Allowed" },
  ];

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Phone is required");
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!area.trim()) {
      toast.error("Area is required");
      return false;
    }
    if (!budgetMin || !budgetMax) {
      toast.error("Budget range is required");
      return false;
    }
    if (parseInt(budgetMin) > parseInt(budgetMax)) {
      toast.error("Minimum budget cannot exceed maximum budget");
      return false;
    }
    if (!propertyType) {
      toast.error("Property type is required");
      return false;
    }
    if (!moveInDate) {
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
      const amenitiesList = amenityOptions
        .filter((opt) => amenities[opt.key as keyof typeof amenities])
        .map((opt) => opt.label);

      const { error } = await supabase.from("house_hunting_requests").insert({
        name,
        phone,
        email,
        area,
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        property_type: propertyType,
        move_in_date: moveInDate,
        amenities: amenitiesList.length > 0 ? amenitiesList : null,
      });

      if (error) {
        toast.error("Failed to submit request");
        return;
      }

      toast.success("House hunting request submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-app mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">House Hunting</h1>
          <p className="text-gray-600 mt-2">
            Let our concierge team find your perfect home
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your House Hunting Request</CardTitle>
            <CardDescription>
              Tell us what you're looking for and we'll help you find it
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Property Requirements */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">What are you looking for?</h3>

                <div className="space-y-2">
                  <Label htmlFor="area">Preferred Area(s)</Label>
                  <Input
                    id="area"
                    placeholder="e.g., Westlands, Karen, Makati"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType} disabled={loading}>
                    <SelectTrigger id="propertyType">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget (KES)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="0"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget (KES)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="0"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moveInDate">Desired Move-in Date</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Desired Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenityOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.key}
                        checked={amenities[option.key as keyof typeof amenities]}
                        onCheckedChange={() => toggleAmenity(option.key as keyof typeof amenities)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={option.key}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
