import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const propertyTypes = [
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

const amenities = [
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

export const HouseHuntingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [propertyType, setPropertyType] = useState('1 Bedroom');
  const [moveInDate, setMoveInDate] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, full_name, phone')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setName(profileData.full_name || profileData.first_name || '');
          setPhone(profileData.phone || '');
          setEmail(user.email || '');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    if (!authLoading && user) {
      fetchUserData();
    }
  }, [user, authLoading]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!phone.trim()) {
      toast.error('Phone is required');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!area.trim()) {
      toast.error('Area is required');
      return;
    }

    if (!budgetMin || !budgetMax) {
      toast.error('Budget range is required');
      return;
    }

    if (parseInt(budgetMin) > parseInt(budgetMax)) {
      toast.error('Minimum budget cannot be greater than maximum budget');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('house_hunting_requests').insert([
        {
          user_id: user?.id,
          name,
          phone,
          email,
          area,
          budget_min: parseInt(budgetMin),
          budget_max: parseInt(budgetMax),
          property_type: propertyType,
          move_in_date: moveInDate || null,
          amenities: selectedAmenities.length > 0 ? selectedAmenities : null,
          status: 'pending',
        },
      ]);

      if (error) {
        toast.error('Failed to submit request');
      } else {
        toast.success('House hunting request submitted! Our team will contact you soon.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-app h-16 flex items-center">
          <h1 className="text-2xl font-bold text-white">KejaHub - House Hunting</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl">Find Your Dream Home</CardTitle>
              <CardDescription>
                Fill out this form and our concierge team will help you find the perfect property
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+254..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Property Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Property Preferences</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area/Location</Label>
                      <Input
                        id="area"
                        type="text"
                        placeholder="e.g., Westlands, Kilimani, Upper Hill"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budgetMin">Minimum Budget (KES)</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          placeholder="10000"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budgetMax">Maximum Budget (KES)</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          placeholder="100000"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select value={propertyType} onValueChange={setPropertyType} disabled={loading}>
                        <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moveInDate">Move-in Date</Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-white"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Desired Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                          disabled={loading}
                        />
                        <Label htmlFor={amenity} className="cursor-pointer text-slate-300">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};
