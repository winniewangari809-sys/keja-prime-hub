import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, ListFilter as Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/site";
import { properties, type PropertyCategory, type Property } from "@/lib/mock-data";

export const Route = createFileRoute("/rentals")({
  head: () => ({
    meta: [
      {
        title: "Browse Properties — KejaHub",
      },
      {
        name: "description",
        content:
          "Search for rental homes, apartments, Airbnbs, properties for sale, and commercial spaces in Kenya.",
      },
    ],
  }),
  validateSearch: (search: Record<string, any>) => ({
    category: search.category as PropertyCategory | undefined,
    search: search.search as string | undefined,
    minPrice: search.minPrice as number | undefined,
    maxPrice: search.maxPrice as number | undefined,
    bedrooms: search.bedrooms as number | undefined,
    location: search.location as string | undefined,
  }),
  component: RentalsPage,
});

function RentalsPage() {
  const search = Route.useSearch();
  const [searchQuery, setSearchQuery] = useState(search.search || "");
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | null>(
    search.category as PropertyCategory | null || null
  );
  const [minPrice, setMinPrice] = useState(search.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(search.maxPrice?.toString() || "");
  const [selectedBedrooms, setSelectedBedrooms] = useState(search.bedrooms || 0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (selectedCategory && prop.category !== selectedCategory) return false;
      if (searchQuery && !prop.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !prop.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (minPrice && prop.price < parseInt(minPrice)) return false;
      if (maxPrice && prop.price > parseInt(maxPrice)) return false;
      if (selectedBedrooms > 0 && prop.bedrooms !== selectedBedrooms) return false;
      return true;
    });
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedBedrooms]);

  const categories: { value: PropertyCategory | null; label: string }[] = [
    { value: null, label: "All Properties" },
    { value: "rental", label: "Rentals" },
    { value: "airbnb", label: "Airbnbs" },
    { value: "sale", label: "For Sale" },
    { value: "commercial", label: "Commercial" },
  ];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-transparent py-12">
        <div className="container-app">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Browse our collection of verified properties across Kenya.
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Property Type
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.value
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Bedrooms
                </h3>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedBedrooms(num === selectedBedrooms ? 0 : num)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedBedrooms === num
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {num === 0 ? "Any" : `${num} Bedroom${num > 1 ? "s" : ""}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Price Range
                </h3>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-gray-900 dark:text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setMinPrice("");
                  setMaxPrice("");
                  setSelectedBedrooms(0);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by location or property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Results Info */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold">{filteredProperties.length}</span> properties
              </p>
            </div>

            {/* Property Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                    setMinPrice("");
                    setMaxPrice("");
                    setSelectedBedrooms(0);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
