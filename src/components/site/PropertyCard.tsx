import { Link } from "@tanstack/react-router";
import { Bed, Bath, MapPin, Star } from "lucide-react";
import { Property, formatKES, priceLabel, statusMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const status = statusMeta[property.status];

  return (
    <Link
      to={`/property/${property.slug}`}
      className={cn(
        "group overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 hover-lift bg-white dark:bg-gray-900",
        className
      )}
    >
      <div className="relative overflow-hidden h-48 bg-gray-200 dark:bg-gray-800">
        {property.images[0] && (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Status Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
          status.color
        )}>
          {status.label}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {/* Price */}
        <p className="text-primary font-bold text-lg mb-1">
          {priceLabel(property.price, property.category)}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.bedrooms === 0 && property.bathrooms === 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {property.propertyType}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
