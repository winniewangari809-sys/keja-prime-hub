import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { School, Hospital, DollarSign, Train } from "lucide-react";

const BUSINESS_TYPES = [
  "Shop",
  "Office",
  "Warehouse",
  "Salon Space",
  "Restaurant Space",
];

const NEARBY_AMENITIES = [
  { icon: School, name: "Schools", description: "Quality education institutions" },
  { icon: Hospital, name: "Hospitals", description: "Healthcare facilities" },
  { icon: DollarSign, name: "Banks", description: "Financial services" },
  { icon: Train, name: "Transport", description: "Easy accessibility" },
];

export const CommercialPage = () => {
  const navigate = useNavigate();
  const { user, firstName } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(firstName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [businessType, setBusinessType] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [groundFloor, setGroundFloor] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Business name is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!businessType) newErrors.businessType = "Business type is required";
    if (!area.trim()) newErrors.area = "Area is required";
    if (!budget) newErrors.budget = "Budget is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        user_id: user?.id || null,
      });

      if (error) {
        toast.error(error.message || "Failed to submit request");
      } else {
        toast.success("Request submitted! We'll connect you with available spaces.");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate business potential score
  const calculateScore = (): number => {
    let score = 50; // Base score
    if (parkingNeeded) score += 15;
    if (groundFloor) score += 25;
    if (budget && parseInt(budget) > 100000) score += 10;
    return Math.min(score, 100);
  };

  const businessPotentialScore = calculateScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8">
      <div className="container-app">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Commercial Spaces</h1>
            <p className="text-gray-600">Find the perfect space for your business</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                  <CardTitle>Find Your Business Space</CardTitle>
                  <CardDescription className="text-orange-100">
                    Tell us about your business needs and we'll match you with the perfect space
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your Business Name"
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
                          placeholder="you@business.com"
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

                    {/* Business Type */}
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select value={businessType} onValueChange={(value) => {
                        setBusinessType(value);
                        if (errors.businessType) setErrors({ ...errors, businessType: undefined });
                      }}>
                        <SelectTrigger id="businessType" className={errors.businessType ? "border-red-500" : ""}>
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
                      {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
                    </div>

                    {/* Area */}
                    <div className="space-y-2">
                      <Label htmlFor="area">Preferred Area *</Label>
                      <Input
                        id="area"
                        placeholder="e.g., CBD, Westlands, Industrial Area"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          if (errors.area) setErrors({ ...errors, area: undefined });
                        }}
                        className={errors.area ? "border-red-500" : ""}
                      />
                      {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                      <Label htmlFor="budget">Monthly Budget (KES) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="100000"
                        value={budget}
                        onChange={(e) => {
                          setBudget(e.target.value);
                          if (errors.budget) setErrors({ ...errors, budget: undefined });
                        }}
                        className={errors.budget ? "border-red-500" : ""}
                      />
                      {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
                    </div>

                    {/* Preferences */}
                    <div className="space-y-3">
                      <Label>Space Preferences</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="parking"
                            checked={parkingNeeded}
                            onCheckedChange={(checked) => setParkingNeeded(checked as boolean)}
                          />
                          <label
                            htmlFor="parking"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Parking Required
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="groundFloor"
                            checked={groundFloor}
                            onCheckedChange={(checked) => setGroundFloor(checked as boolean)}
                          />
                          <label
                            htmlFor="groundFloor"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Ground Floor Preferred
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Business Potential Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Potential Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#f97316"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(businessPotentialScore / 100) * 283} 283`}
                          className="transition-all"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">{businessPotentialScore}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Score based on your requirements and preferences
                  </p>
                </CardContent>
              </Card>

              {/* Nearby Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nearby Amenities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {NEARBY_AMENITIES.map(({ icon: Icon, name, description }) => (
                    <div key={name} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Icon className="w-5 h-5 text-orange-600 mt-0.5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-gray-600">{description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Spaces</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">In Nairobi</p>
                    <Badge>145+</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Budget Range</p>
                    <Badge variant="outline">50K-500K</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Average Lead Time</p>
                    <Badge variant="outline">24hrs</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
