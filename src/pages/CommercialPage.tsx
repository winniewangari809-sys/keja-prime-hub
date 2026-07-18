import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, TrendingUp, Landmark } from "lucide-react";

const BUSINESS_TYPES = [
  "Shop",
  "Office",
  "Warehouse",
  "Salon Space",
  "Restaurant Space",
];

interface FormData {
  name: string;
  phone: string;
  email: string;
  business_type: string;
  area: string;
  budget: string;
  parking_needed: boolean;
  ground_floor: boolean;
}

export default function CommercialPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    business_type: "",
    area: "",
    budget: "",
    parking_needed: false,
    ground_floor: false,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, business_type: value }));
  };

  const handleCheckboxChange = (field: "parking_needed" | "ground_floor") => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
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
      });

      if (error) {
        toast.error("Failed to submit request");
      } else {
        toast.success("Commercial request submitted successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getBusinessPotentialScore = (): "High" | "Medium" | "Low" => {
    // Mock scoring based on business type
    const highPotential = ["Shop", "Office", "Restaurant Space"];
    return highPotential.includes(formData.business_type) ? "High" : "Medium";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold mb-2">Commercial Spaces</h1>
        <p className="text-gray-600 mb-8">Find the perfect space for your business</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Space Request</CardTitle>
                <CardDescription>Tell us about your business needs</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Business Owner Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
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
                          placeholder="you@business.com"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Business Requirements */}
                  <div>
                    <h3 className="font-semibold mb-4">Space Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select
                          value={formData.business_type}
                          onValueChange={handleBusinessTypeChange}
                          disabled={loading}
                        >
                          <SelectTrigger id="businessType">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="area">Preferred Area *</Label>
                        <Input
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          placeholder="e.g., Nairobi CBD, Westlands"
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="budget">Monthly Budget (KES) *</Label>
                        <Input
                          id="budget"
                          name="budget"
                          type="number"
                          value={formData.budget}
                          onChange={handleInputChange}
                          placeholder="0"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h3 className="font-semibold mb-4">Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking"
                          checked={formData.parking_needed}
                          onCheckedChange={() => handleCheckboxChange("parking_needed")}
                          disabled={loading}
                        />
                        <Label
                          htmlFor="parking"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Parking space needed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="groundFloor"
                          checked={formData.ground_floor}
                          onCheckedChange={() => handleCheckboxChange("ground_floor")}
                          disabled={loading}
                        />
                        <Label
                          htmlFor="groundFloor"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Ground floor preferred
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sections */}
          <div className="space-y-6">
            {/* Nearby Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Landmark className="w-5 h-5" />
                  Nearby Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Schools</p>
                  <p className="text-sm text-gray-600">Various schools nearby</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Hospitals</p>
                  <p className="text-sm text-gray-600">Healthcare facilities</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Banks</p>
                  <p className="text-sm text-gray-600">Financial institutions</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Supermarkets</p>
                  <p className="text-sm text-gray-600">Retail shopping</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Transport</p>
                  <p className="text-sm text-gray-600">Public transport access</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Potential Score */}
            {formData.business_type && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Business Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Score</p>
                    <Badge
                      variant={
                        getBusinessPotentialScore() === "High"
                          ? "default"
                          : getBusinessPotentialScore() === "Medium"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {getBusinessPotentialScore()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
