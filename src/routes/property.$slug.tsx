import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Share2, Zap, Flag, MapPin, Wifi, Car, Zap as Lightning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConciergeInquiryPanel, LocationInsights } from "@/components/site";
import { properties, priceLabel, formatKES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/property/$slug")({
  head: (ctx) => {
    const { slug } = ctx.params;
    const property = properties.find((p) => p.slug === slug);
    return {
      meta: [
        {
          title: property ? `${property.title} — KejaHub` : "Property — KejaHub",
        },
        {
          name: "description",
          content: property ? property.description : "View property details on KejaHub",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const property = properties.find((p) => p.slug === params.slug);
    if (!property) throw notFound();
    return property;
  },
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const property = Route.useLoaderData();
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Added to saved properties");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property on KejaHub: ${property.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReport = () => {
    toast.success("Report submitted. We'll review it shortly.");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
  };

  return (
    <div className="space-y-0">
      {/* Gallery Section */}
      <div className="relative bg-gray-900 h-96 md:h-[600px]">
        {property.images.length > 0 ? (
          <>
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10 transition-colors"
                >
                  →
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {property.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-white">No images available</p>
          </div>
        )}
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400">
                    <MapPin className="w-5 h-5" />
                    {property.location}
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {priceLabel(property.price, property.category)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    className={isSaved ? "bg-primary/10 border-primary text-primary" : ""}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReport}>
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{property.category}</Badge>
                <Badge variant="outline">{property.status}</Badge>
                <Badge variant="outline">{property.propertyType}</Badge>
              </div>
            </div>

            <Separator />

            {/* Key Features */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Key Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{property.size}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">sqm</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{property.images.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Photos</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {property.description}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Location Insights */}
            <LocationInsights location={property.location} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Concierge Panel */}
            <ConciergeInquiryPanel property={property} />

            {/* Listed By */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Listed by
              </h3>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                KejaHub Concierge
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This property is managed by our trusted KejaHub Concierge team to ensure a smooth experience.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  Message
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  Call
                </Button>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Verified Property
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    This property has been verified by KejaHub Concierge team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
