import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthItem {
  label: string;
  status: "complete" | "partial" | "missing";
  description: string;
  icon: typeof CheckCircle;
}

interface PropertyHealthScoreProps {
  photos?: number;
  hasLocation?: boolean;
  hasPrice?: boolean;
  hasDescription?: boolean;
  hasAmenities?: boolean;
}

export function PropertyHealthScore({
  photos = 0,
  hasLocation = false,
  hasPrice = false,
  hasDescription = false,
  hasAmenities = false,
}: PropertyHealthScoreProps) {
  const items: HealthItem[] = [
    {
      label: "Photos",
      status: photos >= 5 ? "complete" : photos > 0 ? "partial" : "missing",
      description: photos >= 5 ? "5+ photos uploaded" : `${photos} photos (need 5)`,
      icon: CheckCircle,
    },
    {
      label: "Location",
      status: hasLocation ? "complete" : "missing",
      description: hasLocation ? "Location set" : "Add location details",
      icon: CheckCircle,
    },
    {
      label: "Price",
      status: hasPrice ? "complete" : "missing",
      description: hasPrice ? "Price set" : "Add rental/sale price",
      icon: CheckCircle,
    },
    {
      label: "Description",
      status: hasDescription ? "complete" : "missing",
      description: hasDescription ? "Description added" : "Add property description",
      icon: CheckCircle,
    },
    {
      label: "Amenities",
      status: hasAmenities ? "complete" : "missing",
      description: hasAmenities ? "Amenities listed" : "Add property amenities",
      icon: CheckCircle,
    },
  ];

  const completionPercentage = (
    items.filter(i => i.status === "complete").length / items.length
  ) * 100;

  const statusColors: Record<string, string> = {
    complete: "text-success",
    partial: "text-warning",
    missing: "text-gray-400 dark:text-gray-600",
  };

  const statusBgColors: Record<string, string> = {
    complete: "bg-success/10",
    partial: "bg-warning/10",
    missing: "bg-gray-100 dark:bg-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Circular Progress */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Progress circle */}
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(completionPercentage / 100) * 503} 503`}
              className="text-primary transition-all duration-500"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-4xl text-gray-900 dark:text-white">
              {Math.round(completionPercentage)}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete
            </span>
          </div>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Complete your listing to increase visibility and attract more buyers
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-lg border transition-all",
              item.status === "complete"
                ? "border-success/30 bg-success/5"
                : item.status === "partial"
                  ? "border-warning/30 bg-warning/5"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5 flex-shrink-0", statusColors[item.status])}>
                {item.status === "complete" && (
                  <CheckCircle className="w-5 h-5" />
                )}
                {item.status === "partial" && (
                  <AlertCircle className="w-5 h-5" />
                )}
                {item.status === "missing" && (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
              </div>

              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                item.status === "complete"
                  ? "bg-success/10 text-success"
                  : item.status === "partial"
                    ? "bg-warning/10 text-warning"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}>
                {item.status === "complete" ? "Done" : item.status === "partial" ? "Partial" : "Missing"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      {completionPercentage < 100 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Quick Tips to Improve Your Score
          </h4>
          <ul className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
            <li>• Add high-quality photos showing different areas</li>
            <li>• Write a detailed, engaging description</li>
            <li>• List all amenities and special features</li>
            <li>• Verify location with accurate details</li>
          </ul>
        </div>
      )}
    </div>
  );
}
