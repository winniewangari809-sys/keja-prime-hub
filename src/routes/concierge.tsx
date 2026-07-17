import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MessageSquare, Shield, Zap, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/concierge")({
  head: () => ({
    meta: [
      {
        title: "KejaHub Concierge — Property Search Service",
      },
      {
        name: "description",
        content:
          "Let KejaHub's expert concierge team find your perfect property in Kenya. Personalized service, no direct owner contact.",
      },
    ],
  }),
  component: ConciergePage,
});

function ConciergePage() {
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!phone || !location) {
        setError("Phone and location are required");
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("concierge_requests").insert({
        budget: budget ? parseInt(budget) : null,
        location,
        property_type: propertyType || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        notes,
        phone,
      });

      if (insertError) {
        setError(insertError.message);
        toast.error("Failed to submit request: " + insertError.message);
        return;
      }

      toast.success(
        "Request submitted! Our concierge team will contact you within 24 hours."
      );

      // Reset form
      setBudget("");
      setLocation("");
      setPropertyType("");
      setBedrooms("");
      setNotes("");
      setPhone("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-transparent py-16">
        <div className="container-app">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            KejaHub Concierge Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            Tell us what you're looking for, and our expert team will find and present the best options to you.
          </p>
        </div>
      </div>

      <div className="container-app py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Let Us Find For You
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-gray-900 dark:text-white">
                      Preferred Location *
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Westlands, Karen, CBD"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="propertyType" className="text-gray-900 dark:text-white">
                      Property Type
                    </Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <option value="">Select type...</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="commercial">Commercial</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget" className="text-gray-900 dark:text-white">
                      Budget (KES)
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 50000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bedrooms" className="text-gray-900 dark:text-white">
                      Bedrooms
                    </Label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <option value="">Select...</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4+ Bedrooms</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-900 dark:text-white">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Tell us anything else about your ideal property..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose KejaHub?
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Fast & Efficient
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get personalized matches within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Verified Properties
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All properties are verified by our team
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      No Direct Contact
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team handles all negotiations for you
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      24/7 Support
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Support throughout your entire journey
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-primary/10 dark:bg-primary/5 rounded-lg border border-primary/20 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Ready to get started?
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Fill out the form and our team will reach out to you within 24 hours.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Questions? Call us at +254 700 000 000
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container-app">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-12 text-center">
            Our Concierge Packages
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Basic",
                price: "Free",
                features: [
                  "Property search support",
                  "Viewing coordination",
                  "Basic documentation",
                  "Email support",
                ],
              },
              {
                name: "Premium",
                price: "KSh 5,000",
                period: "/property",
                features: [
                  "Everything in Basic",
                  "Negotiation support",
                  "Legal document review",
                  "Inspection coordination",
                  "Priority support",
                ],
                highlighted: true,
              },
              {
                name: "VIP",
                price: "KSh 15,000",
                period: "/property",
                features: [
                  "Everything in Premium",
                  "Dedicated concierge",
                  "Full move-in assistance",
                  "Post-move support (30 days)",
                  "24/7 phone support",
                ],
              },
            ].map((pkg, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-8 ${
                  pkg.highlighted
                    ? "border-primary bg-primary/5 dark:bg-primary/10 scale-105"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {pkg.name}
                </h3>
                <p className="text-3xl font-bold text-primary mb-6">
                  {pkg.price}
                  {pkg.period && <span className="text-lg font-normal">{pkg.period}</span>}
                </p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary font-bold">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={pkg.highlighted ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
