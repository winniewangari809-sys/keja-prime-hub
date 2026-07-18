import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const BUSINESS_TYPES = [
  'Shop',
  'Office',
  'Warehouse',
  'Salon Space',
  'Restaurant Space',
];

const NEARBY_AMENITIES = [
  { name: 'Schools', icon: '🏫' },
  { name: 'Hospitals', icon: '🏥' },
  { name: 'Banks', icon: '🏦' },
  { name: 'Supermarkets', icon: '🛒' },
  { name: 'Transport', icon: '🚌' },
];

export default function CommercialPage() {
  const navigate = useNavigate();
  const { user, firstName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: firstName || '',
    phone: '',
    email: user?.email || '',
    businessType: '',
    area: '',
    budget: '',
    parkingNeeded: false,
    groundFloor: false,
  });

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.businessType) {
      toast.error('Business type is required');
      return false;
    }
    if (!formData.area.trim()) {
      toast.error('Area is required');
      return false;
    }
    if (!formData.budget) {
      toast.error('Budget is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('commercial_requests').insert({
        requester_id: user?.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        business_type: formData.businessType,
        area: formData.area,
        budget: parseInt(formData.budget),
        parking_needed: formData.parkingNeeded,
        ground_floor: formData.groundFloor,
      });

      if (error) {
        toast.error('Failed to submit commercial request');
        console.error(error);
        return;
      }

      toast.success('Commercial request submitted! We will contact you soon.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBusinessPotentialScore = () => {
    if (!formData.businessType || !formData.area) return null;
    const scores: { [key: string]: string } = {
      'Shop': 'High',
      'Office': 'High',
      'Warehouse': 'Medium',
      'Salon Space': 'Medium',
      'Restaurant Space': 'High',
    };
    return scores[formData.businessType] || 'Medium';
  };

  const scoreColor: { [key: string]: string } = {
    High: 'bg-green-100 text-green-800',
    Medium: 'bg-amber-100 text-amber-800',
    Low: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-slate-900">Commercial Spaces</h1>
            <p className="text-slate-600 mt-1">Find the perfect business location</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Space Request</CardTitle>
                <CardDescription>
                  Tell us about your business needs and we'll find suitable spaces
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Name and Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Owner Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254..."
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Business Type */}
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, businessType: value })
                      }
                    >
                      <SelectTrigger>
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

                  {/* Area */}
                  <div className="space-y-2">
                    <Label htmlFor="area">Preferred Area</Label>
                    <Input
                      id="area"
                      placeholder="e.g., Nairobi CBD, Westlands, Mombasa"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                    />
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget (KES)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="100000"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-3">
                    <Label>Requirements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking"
                          checked={formData.parkingNeeded}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              parkingNeeded: checked as boolean,
                            })
                          }
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
                          checked={formData.groundFloor}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              groundFloor: checked as boolean,
                            })
                          }
                        />
                        <label
                          htmlFor="groundFloor"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Ground Floor Only
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Business Potential Score */}
            {getBusinessPotentialScore() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`text-lg px-4 py-2 ${scoreColor[getBusinessPotentialScore() || 'Medium']}`}>
                    {getBusinessPotentialScore()} Score
                  </Badge>
                  <p className="text-sm text-slate-600 mt-3">
                    Based on the {formData.businessType} business type in {formData.area || 'your selected area'}, the commercial space potential is rated {getBusinessPotentialScore()?.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Nearby Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Typical amenities you'll find in commercial areas:
                </p>
                <div className="space-y-3">
                  {NEARBY_AMENITIES.map((amenity) => (
                    <div key={amenity.name} className="flex items-center gap-3">
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className="text-sm font-medium text-slate-700">
                        {amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-slate-900">Location is Key</p>
                  <p className="text-xs text-slate-600">Choose areas with high foot traffic</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm text-slate-900">Budget Wisely</p>
                  <p className="text-xs text-slate-600">Leave room for utilities and maintenance</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm text-slate-900">Plan Ahead</p>
                  <p className="text-xs text-slate-600">Secure your space before peak seasons</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
