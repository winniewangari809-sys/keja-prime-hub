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

export const Route = createFileRoute("/commercial")({
  component: CommercialComponent,
});

interface FormData {
  name: string;
  phone: string;
  email: string;
  business_type: string;
  area: string;
  budget: string;
}

function CommercialComponent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [groundFloor, setGroundFloor] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    business_type: "",
    area: "",
    budget: "",
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
    if (!formData.business_type) {
      toast.error("Business type is required");
      return false;
    }
    if (!formData.area.trim()) {
      toast.error("Area/Location is required");
      return false;
    }
    if (!formData.budget.trim()) {
      toast.error("Budget is required");
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
        .from("commercial_requests")
        .insert([
          {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            business_type: formData.business_type,
            area: formData.area,
            budget: parseInt(formData.budget),
            parking_needed: parkingNeeded,
            ground_floor_required: groundFloor,
          },
        ]);

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Commercial request submitted successfully!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error("An error occurred while submitting your request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Commercial Space Request</CardTitle>
              <CardDescription>
                Tell us about your commercial space needs
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                    Your Information
                  </h3>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254 700 000000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
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
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                    Business Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Select value={formData.business_type} onValueChange={(value) => setFormData({ ...formData, business_type: value })}>
                      <SelectTrigger id="business_type" disabled={loading}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail Shop</SelectItem>
                        <SelectItem value="office">Office Space</SelectItem>
                        <SelectItem value="restaurant">Restaurant/Cafe</SelectItem>
                        <SelectItem value="salon">Salon/Spa</SelectItem>
                        <SelectItem value="gym">Fitness Center</SelectItem>
                        <SelectItem value="clinic">Clinic/Medical</SelectItem>
                        <SelectItem value="warehouse">Warehouse/Storage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Preferred Area</Label>
                    <Input
                      id="area"
                      type="text"
                      placeholder="e.g., Nairobi CBD, Westlands, Kilimani"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget (KES)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 200000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                    Requirements
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parking"
                        checked={parkingNeeded}
                        onCheckedChange={(checked) => setParkingNeeded(checked as boolean)}
                        disabled={loading}
                      />
                      <Label htmlFor="parking" className="cursor-pointer font-normal">
                        Parking needed
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ground_floor"
                        checked={groundFloor}
                        onCheckedChange={(checked) => setGroundFloor(checked as boolean)}
                        disabled={loading}
                      />
                      <Label htmlFor="ground_floor" className="cursor-pointer font-normal">
                        Ground floor required
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Schools
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Nairobi Primary School</li>
                      <li>• Kenya High School</li>
                      <li>• Strathmore University</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Hospitals
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Nairobi Hospital</li>
                      <li>• The Aga Khan Hospital</li>
                      <li>• Kenyatta National Hospital</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Financial Services
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Kenya Commercial Bank</li>
                      <li>• Equity Bank</li>
                      <li>• Co-operative Bank</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Shopping
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• The Junction Mall</li>
                      <li>• Westgate Mall</li>
                      <li>• Village Market</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Choose KejaHub?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Access to premium commercial spaces</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Expert business location consultants</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Quick lease processing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Competitive market rates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
