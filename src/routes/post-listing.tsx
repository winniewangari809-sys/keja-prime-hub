import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SmartPhotoUploader, PropertyHealthScore } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRequireRole } from "@/hooks/use-require-role";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/post-listing")({
  head: () => ({
    meta: [
      {
        title: "Post a Listing — KejaHub",
      },
      {
        name: "description",
        content:
          "List your property on KejaHub. Easy, secure, and transparent property listing in Kenya.",
      },
    ],
  }),
  component: PostListingPage,
});

function PostListingPage() {
  const navigate = useNavigate();
  const { loading, user, role, firstName } = useRequireRole([
    "seller",
    "landlord",
    "agent",
    "airbnb",
    "commercial",
  ]);

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);

  // Step 0: Type
  const [propertyType, setPropertyType] = useState<string>("");

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Location
  const [county, setCounty] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");

  // Step 3: Photos
  const [images, setImages] = useState<string[]>([]);

  // Step 4: Video
  const [videoUrl, setVideoUrl] = useState("");

  // Step 5: Contact
  const [contactName, setContactName] = useState(firstName || "");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  const handleNext = () => {
    setError(null);

    if (step === 0 && !propertyType) {
      setError("Please select a property type");
      return;
    }
    if (step === 1 && (!title || !price)) {
      setError("Title and price are required");
      return;
    }
    if (step === 2 && (!county || !area)) {
      setError("County and area are required");
      return;
    }

    if (step < 6) {
      setStep((step + 1) as any);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep((step - 1) as any);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!user) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const { error: insertError } = await supabase.from("properties").insert({
        user_id: user.id,
        slug,
        title,
        location: `${area}, ${county}`,
        price: parseInt(price),
        category: propertyType as any,
        property_type: propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms) : 0,
        bathrooms: bathrooms ? parseInt(bathrooms) : 0,
        size: size ? parseInt(size) : 0,
        description,
        images,
        featured: false,
        status: "available",
        video_url: videoUrl || null,
      });

      if (insertError) {
        setError(insertError.message);
        toast.error("Failed to create listing: " + insertError.message);
        setIsLoading(false);
        return;
      }

      toast.success("Property listed successfully!");
      setTimeout(() => {
        navigate({ to: "/dashboard/seller" });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-8">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Post Your Property
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Step {step + 1} of 7
            </p>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((step + 1) / 7) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
            {/* Step 0: Property Type */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  What type of property are you listing?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["rental", "sale", "airbnb", "commercial"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setPropertyType(type)}
                      className={`p-6 border-2 rounded-lg transition-all text-left font-semibold capitalize ${
                        propertyType === type
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                      }`}
                    >
                      {type === "rental"
                        ? "Rental Property"
                        : type === "sale"
                          ? "Property for Sale"
                          : type === "airbnb"
                            ? "Airbnb/Short-term"
                            : "Commercial"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Property Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Luxury 3-bedroom apartment in Westlands"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">
                      Price (KES) {propertyType === "rental" && " per month"}
                      {propertyType === "airbnb" && " per night"} *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="0"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="0"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="size">Size (sqm)</Label>
                      <Input
                        id="size"
                        type="number"
                        placeholder="0"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your property..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLoading}
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Location
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="county">County *</Label>
                    <Select value={county} onValueChange={setCounty}>
                      <option value="">Select county...</option>
                      <option value="Nairobi">Nairobi</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Makueni">Makueni</option>
                      <option value="Mombasa">Mombasa</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="area">Area/Estate *</Label>
                    <Input
                      id="area"
                      placeholder="e.g., Westlands, Karen"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g., 123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Photos
                </h2>
                <SmartPhotoUploader
                  onImagesChange={setImages}
                  value={images}
                />
              </div>
            )}

            {/* Step 4: Video */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Video (Optional)
                </h2>
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    YouTube or Vimeo URL recommended
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Contact */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="contactName">Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Your name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Review Your Listing
                </h2>

                <div className="space-y-6">
                  <PropertyHealthScore property={{} as any} />

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        KES {price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {area}, {county}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bedrooms
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {bedrooms}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Description
                    </p>
                    <p className="text-gray-900 dark:text-white">{description}</p>
                  </div>

                  {images.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Photos ({images.length})
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          {images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Preview ${idx}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {step < 6 && (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === 6 && (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Publishing..." : "Publish Listing"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
