import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const PROPERTY_TYPES = [
  'Single Room',
  'Bedsitter',
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4 Bedroom',
  'Maisonette',
  'Penthouse',
];

const AMENITIES = [
  'Parking',
  'Security',
  'Water',
  'WiFi',
  'Furnished',
  'Balcony',
  'Gym',
  'Swimming Pool',
  'Pets Allowed',
];

export default function HouseHuntingPage() {
  const navigate = useNavigate();
  const { user, firstName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: firstName || '',
    phone: '',
    email: user?.email || '',
    area: '',
    budgetMin: '',
    budgetMax: '',
    propertyType: '',
    moveInDate: '',
    amenities: [] as string[],
  });

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

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
    if (!formData.area.trim()) {
      toast.error('Area is required');
      return false;
    }
    if (!formData.budgetMin) {
      toast.error('Budget minimum is required');
      return false;
    }
    if (!formData.budgetMax) {
      toast.error('Budget maximum is required');
      return false;
    }
    if (!formData.propertyType) {
      toast.error('Property type is required');
      return false;
    }
    if (!formData.moveInDate) {
      toast.error('Move-in date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('house_hunting_requests').insert({
        requester_id: user?.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        area: formData.area,
        budget_min: parseInt(formData.budgetMin),
        budget_max: parseInt(formData.budgetMax),
        property_type: formData.propertyType,
        move_in_date: formData.moveInDate,
        amenities: formData.amenities,
      });

      if (error) {
        toast.error('Failed to submit house hunting request');
        console.error(error);
        return;
      }

      toast.success('House hunting request submitted! We will contact you soon.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-slate-900">House Hunting Service</h1>
            <p className="text-slate-600 mt-1">Let us find your dream home</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Tell Us What You're Looking For</CardTitle>
              <CardDescription>
                Fill in your preferences and our team will find the perfect property for you
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Name and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
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

                {/* Area */}
                <div className="space-y-2">
                  <Label htmlFor="area">Preferred Area</Label>
                  <Input
                    id="area"
                    placeholder="e.g., Nairobi, Mombasa, Kisumu"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                  />
                </div>

                {/* Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Budget Min (KES)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="50000"
                      value={formData.budgetMin}
                      onChange={(e) =>
                        setFormData({ ...formData, budgetMin: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Budget Max (KES)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="200000"
                      value={formData.budgetMax}
                      onChange={(e) =>
                        setFormData({ ...formData, budgetMax: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, propertyType: value })
                    }
                  >
                    <SelectTrigger>
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
                </div>

                {/* Move-in Date */}
                <div className="space-y-2">
                  <Label htmlFor="moveInDate">Move-in Date</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) =>
                      setFormData({ ...formData, moveInDate: e.target.value })
                    }
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Desired Amenities</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityChange(amenity)}
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
      </div>
    </div>
  );
}
