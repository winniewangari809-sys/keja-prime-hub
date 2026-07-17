import { MapPin, School, Hospital, Landmark, ShoppingCart, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyAmenity {
  name: string;
  distance: string;
  icon: typeof School;
  type: string;
}

interface LocationInsightsProps {
  location: string;
}

const NEARBY_AMENITIES: NearbyAmenity[] = [
  { name: "Kilimani Primary School", distance: "0.5 km", icon: School, type: "School" },
  { name: "Nairobi Hospital", distance: "1.2 km", icon: Hospital, type: "Hospital" },
  { name: "Standard Chartered Bank", distance: "0.8 km", icon: Landmark, type: "Bank" },
  { name: "Nakumatt Supermarket", distance: "0.3 km", icon: ShoppingCart, type: "Shopping" },
  { name: "Kenya Red Cross Society", distance: "1.5 km", icon: Hospital, type: "Health" },
  { name: "Jam Transport Hub", distance: "0.7 km", icon: Bus, type: "Transport" },
];

export function LocationInsights({ location }: LocationInsightsProps) {
  const amenityTypes = [
    { icon: School, label: "Schools", count: 3 },
    { icon: Hospital, label: "Hospitals", count: 2 },
    { icon: Landmark, label: "Banks", count: 4 },
    { icon: ShoppingCart, label: "Shopping", count: 5 },
    { icon: Bus, label: "Transport", count: 3 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-3xl mb-2 flex items-center gap-2">
          <MapPin className="w-8 h-8 text-primary" />
          Location Insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Nearby amenities and services in {location}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {amenityTypes.map((type, idx) => {
          const Icon = type.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center hover:shadow-soft transition-shadow"
            >
              <div className="flex items-center justify-center mb-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {type.label}
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                {type.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Amenities List */}
      <div>
        <h3 className="font-display font-bold text-xl mb-4">Nearby Amenities</h3>

        <div className="space-y-3">
          {NEARBY_AMENITIES.map((amenity, idx) => {
            const Icon = amenity.icon;
            const distanceNum = parseInt(amenity.distance);
            const isNear = distanceNum <= 0.5;
            const isClose = distanceNum <= 1;

            return (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  isNear
                    ? "bg-success/5 border-success/30"
                    : isClose
                      ? "bg-warning/5 border-warning/30"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-lg flex-shrink-0",
                    isNear
                      ? "bg-success/10"
                      : isClose
                        ? "bg-warning/10"
                        : "bg-primary/10"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      isNear
                        ? "text-success"
                        : isClose
                          ? "text-warning"
                          : "text-primary"
                    )} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {amenity.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {amenity.type}
                        </p>
                      </div>

                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                        isNear
                          ? "bg-success/10 text-success"
                          : isClose
                            ? "bg-warning/10 text-warning"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}>
                        {amenity.distance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Area Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Area Information
        </h3>
        <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <li>✓ Well-connected neighborhood with good infrastructure</li>
          <li>✓ Excellent proximity to schools and educational institutions</li>
          <li>✓ Multiple healthcare facilities within walking distance</li>
          <li>✓ Great shopping and dining options nearby</li>
          <li>✓ Easy access to public transportation</li>
        </ul>
      </div>
    </div>
  );
}
