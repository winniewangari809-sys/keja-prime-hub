import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building, MapPin, TrendingUp } from "lucide-react";

export const CommercialPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [groundFloor, setGroundFloor] = useState(false);
  const [loading, setLoading] = useState(false);

  const businessTypeOptions = [
    "Shop",
    "Office",
    "Warehouse",
    "Salon Space",
    "Restaurant Space",
  ];

  const amenities = [
    { icon: MapPin, label: "Schools", count: "12" },
    { icon: Building, label: "Hospitals", count: "8" },
    { icon: Building, label: "Banks", count: "15" },
    { icon: Building, label: "Supermarkets", count: "10" },
    { icon: Building, label: "Transport", count: "5" },
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
    if (!businessType) {
      toast.error("Business type is required");
      return false;
    }
    if (!area.trim()) {
      toast.error("Area is required");
      return false;
    }
    if (!budget || parseInt(budget) <= 0) {
      toast.error("Budget must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("commercial_requests").insert({
        name,
        phone,
        email,
        business_type: businessType,
        area,
        budget: parseInt(budget),
        parking_needed: parkingNeeded,
        ground_floor: groundFloor,
      });

      if (error) {
        toast.error("Failed to submit request");
        return;
      }

      toast.success("Commercial space request submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (): number => {
    let score = 50; // Base score
    if (groundFloor) score += 15;
    if (parkingNeeded) score += 10;
    if (area.length > 5) score += 10;
    if (parseInt(budget) > 100000) score += 15;
    return Math.min(score, 100);
  };

  const businessPotentialScore = calculateScore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-app mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Commercial Spaces</h1>
          <p className="text-gray-600 mt-2">Find the perfect space for your business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Space Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your business needs
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

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Business Details</h3>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Type of Business Space</Label>
                      <Select value={businessType} onValueChange={setBusinessType} disabled={loading}>
                        <SelectTrigger id="businessType">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Preferred Area(s)</Label>
                      <Input
                        id="area"
                        placeholder="e.g., CBD, Westlands, Industrial Area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Monthly Budget (KES)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="0"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Preferences</h3>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking"
                          checked={parkingNeeded}
                          onCheckedChange={(checked) => setParkingNeeded(checked as boolean)}
                          disabled={loading}
                        />
                        <Label
                          htmlFor="parking"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Parking is essential
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="groundFloor"
                          checked={groundFloor}
                          onCheckedChange={(checked) => setGroundFloor(checked as boolean)}
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
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Potential Score */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Business Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {businessPotentialScore}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on your preferences
                  </p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${businessPotentialScore}%` }}
                  />
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Ground floor location: +15%</p>
                  <p>• Parking availability: +10%</p>
                  <p>• Higher budget: +15%</p>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Amenities</CardTitle>
                <CardDescription>In the {area || "selected"} area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {amenities.map((amenity) => {
                  const IconComponent = amenity.icon;
                  return (
                    <div key={amenity.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {amenity.label}
                        </span>
                      </div>
                      <Badge variant="outline">{amenity.count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Commercial Spaces?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Verified business locations</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Competitive pricing</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Expert consultation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
