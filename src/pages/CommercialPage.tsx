import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader, MapPin, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const businessTypes = [
  'Shop',
  'Office',
  'Warehouse',
  'Salon Space',
  'Restaurant Space',
];

const nearbyAmenities = [
  { name: 'Schools', icon: '🏫' },
  { name: 'Hospitals', icon: '🏥' },
  { name: 'Banks', icon: '🏦' },
  { name: 'Supermarkets', icon: '🛒' },
  { name: 'Transport', icon: '🚌' },
];

export const CommercialPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('Shop');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [groundFloor, setGroundFloor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businessScore, setBusinessScore] = useState(65);

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

  // Calculate business potential score based on location and amenities
  const updateBusinessScore = () => {
    let score = 50;
    if (area.trim()) score += 15;
    if (parkingNeeded) score += 10;
    if (groundFloor) score += 10;
    setBusinessScore(Math.min(score, 100));
  };

  useEffect(() => {
    updateBusinessScore();
  }, [area, parkingNeeded, groundFloor]);

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

    if (!budget) {
      toast.error('Budget is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('commercial_requests').insert([
        {
          user_id: user?.id,
          name,
          phone,
          email,
          business_type: businessType,
          area,
          budget: parseInt(budget),
          parking_needed: parkingNeeded,
          ground_floor: groundFloor,
          status: 'pending',
        },
      ]);

      if (error) {
        toast.error('Failed to submit request');
      } else {
        toast.success('Commercial space request submitted! Our team will contact you soon.');
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
          <h1 className="text-2xl font-bold text-white">KejaHub - Commercial Spaces</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl">Find Your Commercial Space</CardTitle>
                <CardDescription>
                  We'll help you find the perfect location for your business
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
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

                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select value={businessType} onValueChange={setBusinessType} disabled={loading}>
                          <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Space Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Space Requirements</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="area">Preferred Area/Location</Label>
                        <Input
                          id="area"
                          type="text"
                          placeholder="e.g., CBD, Westlands, Industrial Area"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget">Monthly Budget (KES)</Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="50000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="parking"
                            checked={parkingNeeded}
                            onCheckedChange={(checked) => setParkingNeeded(checked as boolean)}
                            disabled={loading}
                          />
                          <Label htmlFor="parking" className="cursor-pointer text-slate-300">
                            Parking Space Required
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="groundFloor"
                            checked={groundFloor}
                            onCheckedChange={(checked) => setGroundFloor(checked as boolean)}
                            disabled={loading}
                          />
                          <Label htmlFor="groundFloor" className="cursor-pointer text-slate-300">
                            Ground Floor Preferred
                          </Label>
                        </div>
                      </div>
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

          {/* Info Section */}
          <div className="space-y-6">
            {/* Business Potential Score */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Business Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Potential Score</span>
                    <span className="text-2xl font-bold text-green-400">{businessScore}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${businessScore}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  Score based on location, amenities, and space preferences
                </p>
              </CardContent>
            </Card>

            {/* Nearby Amenities */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Nearby Amenities
                </CardTitle>
                <CardDescription>
                  Typical amenities in commercial areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nearbyAmenities.map((amenity) => (
                    <div key={amenity.name} className="flex items-center gap-3">
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className="text-slate-300">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Why Choose KejaHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Access to best commercial spaces</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Expert location recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Transparent pricing & terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Fast negotiation support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
