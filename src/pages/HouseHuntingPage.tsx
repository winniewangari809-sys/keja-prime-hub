import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  "Parking",
  "Security",
  "Water",
  "WiFi",
  "Furnished",
  "Balcony",
  "Gym",
  "Swimming Pool",
  "Pets Allowed",
];

export const HouseHuntingPage = () => {
  const navigate = useNavigate();
  const { user, firstName } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(firstName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [area, setArea] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!area.trim()) newErrors.area = "Area is required";
    if (!budgetMin) newErrors.budgetMin = "Minimum budget is required";
    if (!budgetMax) newErrors.budgetMax = "Maximum budget is required";
    if (!propertyType) newErrors.propertyType = "Property type is required";
    if (!moveInDate) newErrors.moveInDate = "Move-in date is required";

    const minBudget = parseInt(budgetMin);
    const maxBudget = parseInt(budgetMax);
    if (minBudget > maxBudget) {
      newErrors.budgetMin = "Minimum budget must be less than maximum budget";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("house_hunting_requests").insert({
        name,
        phone,
        email,
        area,
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        property_type: propertyType,
        move_in_date: moveInDate,
        amenities: amenities,
        user_id: user?.id || null,
      });

      if (error) {
        toast.error(error.message || "Failed to submit request");
      } else {
        toast.success("Request submitted! Our team will contact you soon.");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container-app max-w-2xl">
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle>House Hunting Concierge Service</CardTitle>
            <CardDescription className="text-green-100">
              Tell us what you're looking for, and our team will help you find the perfect home
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label htmlFor="area">Preferred Area/Location *</Label>
                <Input
                  id="area"
                  placeholder="e.g., Westlands, Kilimani, Upper Hill"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    if (errors.area) setErrors({ ...errors, area: undefined });
                  }}
                  className={errors.area ? "border-red-500" : ""}
                />
                {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
              </div>

              {/* Budget Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Budget Min (KES) *</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="50000"
                    value={budgetMin}
                    onChange={(e) => {
                      setBudgetMin(e.target.value);
                      if (errors.budgetMin) setErrors({ ...errors, budgetMin: undefined });
                    }}
                    className={errors.budgetMin ? "border-red-500" : ""}
                  />
                  {errors.budgetMin && <p className="text-sm text-red-500">{errors.budgetMin}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Budget Max (KES) *</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="150000"
                    value={budgetMax}
                    onChange={(e) => {
                      setBudgetMax(e.target.value);
                      if (errors.budgetMax) setErrors({ ...errors, budgetMax: undefined });
                    }}
                    className={errors.budgetMax ? "border-red-500" : ""}
                  />
                  {errors.budgetMax && <p className="text-sm text-red-500">{errors.budgetMax}</p>}
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select value={propertyType} onValueChange={(value) => {
                  setPropertyType(value);
                  if (errors.propertyType) setErrors({ ...errors, propertyType: undefined });
                }}>
                  <SelectTrigger id="propertyType" className={errors.propertyType ? "border-red-500" : ""}>
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
                {errors.propertyType && <p className="text-sm text-red-500">{errors.propertyType}</p>}
              </div>

              {/* Move-in Date */}
              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in Date *</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={moveInDate}
                  onChange={(e) => {
                    setMoveInDate(e.target.value);
                    if (errors.moveInDate) setErrors({ ...errors, moveInDate: undefined });
                  }}
                  className={errors.moveInDate ? "border-red-500" : ""}
                />
                {errors.moveInDate && <p className="text-sm text-red-500">{errors.moveInDate}</p>}
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <Label>Preferred Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <label
                        htmlFor={amenity}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                Our concierge team will review your request and contact you within 24 hours.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
