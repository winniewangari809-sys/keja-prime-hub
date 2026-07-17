import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, Home, DollarSign } from "lucide-react";

const CATEGORIES = [
  { value: "rental", label: "Rentals" },
  { value: "airbnb", label: "Airbnbs" },
  { value: "sale", label: "For Sale" },
  { value: "commercial", label: "Commercial" },
];

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Studio",
  "Land",
  "Office",
  "Shop",
];

export function DashboardSearchBar() {
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("rental");
  const [propertyType, setPropertyType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    if (location) searchParams.set("location", location);
    if (category) searchParams.set("category", category);
    if (propertyType) searchParams.set("type", propertyType);
    if (priceMin) searchParams.set("priceMin", priceMin);
    if (priceMax) searchParams.set("priceMax", priceMax);

    navigate({
      to: "/rentals",
      search: Object.fromEntries(searchParams),
    });
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Location */}
      <div>
        <label className="block text-sm font-semibold mb-2">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Kilimani, Nairobi"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-semibold mb-2">Property Type</label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Price Range (KSh)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <Search className="w-5 h-5" />
        Search Properties
      </button>
    </form>
  );
}
