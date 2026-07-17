import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Home, MapPin, Users } from "lucide-react";
import { GoldenHero, PropertyCard } from "@/components/site";
import { Button } from "@/components/ui/button";
import { properties, formatKES, priceLabel } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "KejaHub — Kenya's Property Concierge Platform",
      },
      {
        name: "description",
        content:
          "Discover your perfect property in Kenya with KejaHub's trusted concierge service. Browse rentals, properties for sale, Airbnbs, and commercial spaces.",
      },
    ],
  }),
  component: Homepage,
});

function Homepage() {
  const featuredProperties = properties.filter((p) => p.featured).slice(0, 6);
  const trustedProperties = properties.filter((p) => p.status === "available").slice(0, 3);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <GoldenHero />

      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-app">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Discover hand-picked properties that match your lifestyle and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/rentals">
              <Button size="lg" variant="outline">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Properties Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-app">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Verified and vetted by our KejaHub Concierge team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustedProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-lg/20 transition-shadow"
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                  {property.images[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {property.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-primary font-bold mb-3">{priceLabel(property.price, property.category)}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>🛏️ {property.bedrooms} Beds</span>
                      <span>🚿 {property.bathrooms} Baths</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>
                  <Link to={`/property/${property.slug}`} className="block">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-transparent">
        <div className="container-app">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              How KejaHub Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Find your perfect property in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Browse our curated collection of properties in your desired location and budget range.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Connect via Concierge
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our KejaHub Concierge team handles all details so you never speak directly with owners.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Move In
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We guide you through the entire process until you're settled in your new property.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Concierge Services Preview */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
                Personalized Concierge Service
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Skip the hassle of property hunting. Tell us what you're looking for, and our expert
                concierge team will find and present the best options to you.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Verified properties and landlords
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Negotiate on your behalf
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Handle all paperwork
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    24/7 support after move-in
                  </span>
                </li>
              </ul>
              <Link to="/concierge">
                <Button size="lg">
                  Get Started with Concierge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-32 h-32 text-primary/30" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
