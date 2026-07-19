import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, School, Hospital, Landmark, Utensils, Bus } from "lucide-react";
import { toast } from "sonner";

export const CommercialPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
    business_type: "",
    area: "",
    budget: "",
    parking_needed: false,
    ground_floor: false,
  });

  const businessTypes = [
    "Shop",
    "Office",
    "Warehouse",
    "Salon Space",
    "Restaurant Space",
  ];

  const nearbyAmenities = [
    { icon: School, label: "Schools", color: "text-blue-600" },
    { icon: Hospital, label: "Hospitals", color: "text-red-600" },
    { icon: Landmark, label: "Banks", color: "text-slate-600" },
    { icon: Utensils, label: "Supermarkets", color: "text-green-600" },
    { icon: Bus, label: "Transport", color: "text-orange-600" },
  ];

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateBusinessScore = () => {
    let score = 0;
    if (formData.parking_needed) score += 10;
    if (formData.ground_floor) score += 15;
    if (formData.area) score += 20;
    if (formData.budget) score += 20;
    if (formData.business_type) score += 20;
    if (formData.email) score += 15;
    return Math.min(100, score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.business_type ||
      !formData.area ||
      !formData.budget
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("commercial_requests").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        business_type: formData.business_type,
        area: formData.area,
        budget: parseInt(formData.budget),
        parking_needed: formData.parking_needed,
        ground_floor: formData.ground_floor,
        user_id: user?.id || null,
      });

      if (error) throw error;
      toast.success("Commercial request submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to submit commercial request");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const businessScore = calculateBusinessScore();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Commercial Spaces</h1>
          <p className="mt-2 text-lg text-slate-600">
            Find the perfect space for your business
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Space Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your business needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Business Owner Name *</Label>
                        <Input
                          id="name"
                          placeholder="Jane Smith"
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

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Business Requirements</h3>
                    <div className="space-y-2">
                      <Label htmlFor="business_type">Business Type *</Label>
                      <Select
                        value={formData.business_type}
                        onValueChange={(value) =>
                          handleFormChange("business_type", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger id="business_type">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Preferred Area *</Label>
                      <Input
                        id="area"
                        placeholder="e.g., Westlands, Nairobi CBD, Parklands"
                        value={formData.area}
                        onChange={(e) => handleFormChange("area", e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (KES) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="100000"
                        value={formData.budget}
                        onChange={(e) => handleFormChange("budget", e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Special Requirements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking_needed"
                          checked={formData.parking_needed}
                          onCheckedChange={(checked) =>
                            handleFormChange("parking_needed", checked)
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="parking_needed" className="cursor-pointer">
                          Parking Required
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ground_floor"
                          checked={formData.ground_floor}
                          onCheckedChange={(checked) =>
                            handleFormChange("ground_floor", checked)
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="ground_floor" className="cursor-pointer">
                          Ground Floor Only
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Business Potential Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Potential Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">Score</span>
                      <Badge
                        variant={
                          businessScore >= 80
                            ? "default"
                            : businessScore >= 60
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {businessScore}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all ${
                          businessScore >= 80
                            ? "bg-green-600"
                            : businessScore >= 60
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                        style={{ width: `${businessScore}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Complete more fields to improve your score and get better matches
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nearbyAmenities.map((amenity) => {
                    const IconComponent = amenity.icon;
                    return (
                      <div key={amenity.label} className="flex items-center gap-3">
                        <IconComponent className={`h-5 w-5 ${amenity.color}`} />
                        <span className="text-sm text-slate-700">{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Featured Spaces */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Business Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {businessTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFormChange("business_type", type)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
