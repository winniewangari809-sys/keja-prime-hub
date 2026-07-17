import { Eye, Heart, MessageSquare, Home, TrendingUp } from "lucide-react";
import { properties } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface PerformanceStat {
  icon: typeof Eye;
  label: string;
  value: number;
  color: string;
}

export function ListingPerformance() {
  // Mock performance data
  const stats: PerformanceStat[] = [
    {
      icon: Eye,
      label: "Views",
      value: Math.floor(Math.random() * 5000) + 500,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Heart,
      label: "Saves",
      value: Math.floor(Math.random() * 500) + 50,
      color: "text-red-600 dark:text-red-400",
    },
    {
      icon: MessageSquare,
      label: "Inquiries",
      value: Math.floor(Math.random() * 200) + 20,
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: Home,
      label: "Viewings",
      value: Math.floor(Math.random() * 50) + 5,
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  // Get top performing properties
  const topProperties = properties.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-primary" />
        <h2 className="font-display font-bold text-3xl">Your Listings Performance</h2>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                {stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Top Performing Listings */}
      <div>
        <h3 className="font-display font-bold text-2xl mb-4">Top Performing Listings</h3>

        <div className="space-y-3">
          {topProperties.map((property, idx) => (
            <div
              key={property.id}
              className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {property.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {property.location}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold">
                        {Math.floor(Math.random() * 5000) + 500}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="font-semibold">
                        {Math.floor(Math.random() * 500) + 50}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">
                        {Math.floor(Math.random() * 200) + 20}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Performance
                  </p>
                  <div className="w-16 h-8 bg-gradient-primary rounded flex items-center justify-center">
                    <p className="font-bold text-white text-sm">
                      {Math.floor(Math.random() * 40) + 60}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Performance Insights
        </h3>
        <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <li>✓ Your listings are performing 35% better than average</li>
          <li>✓ Morning hours (8am-10am) get the most views</li>
          <li>✓ High-quality photos increase inquiries by 50%</li>
          <li>✓ Adding amenities descriptions helps with search ranking</li>
        </ul>
      </div>
    </div>
  );
}
