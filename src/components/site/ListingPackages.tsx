import { CircleCheck as CheckCircle, Package } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { cn } from "@/lib/utils";

interface ListingPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const LISTING_PACKAGES: ListingPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    description: "Free listing",
    features: [
      "Property listing",
      "Up to 5 photos",
      "Basic information",
      "Contact form",
      "30-day visibility",
    ],
  },
  {
    id: "verified",
    name: "Verified",
    price: 1500,
    description: "Build credibility",
    features: [
      "Everything in Basic",
      "Verified badge",
      "Up to 20 photos",
      "Detailed description",
      "90-day visibility",
      "Premium support",
    ],
    popular: true,
  },
  {
    id: "featured",
    name: "Featured",
    price: 3000,
    description: "Stand out more",
    features: [
      "Everything in Verified",
      "Featured badge",
      "Homepage placement",
      "Up to 30 photos",
      "6-month visibility",
      "Email marketing",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 5000,
    description: "Maximum reach",
    features: [
      "Everything in Featured",
      "Premium placement",
      "Unlimited photos",
      "Video support",
      "1-year visibility",
      "Concierge support",
      "Monthly reports",
    ],
  },
];

export function ListingPackages() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="font-display font-bold text-4xl">Listing Packages</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Choose the perfect package to showcase your property
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {LISTING_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={cn(
              "relative rounded-lg border transition-all duration-200 flex flex-col",
              pkg.popular
                ? "border-primary shadow-elegant lg:scale-105 bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            )}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-display font-bold text-xl mb-2">
                {pkg.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {pkg.description}
              </p>

              <div className="mb-6">
                <span className="font-display font-bold text-3xl">
                  KSh {pkg.price.toLocaleString()}
                </span>
                {pkg.price > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    one-time fee
                  </p>
                )}
              </div>

              <button
                className={cn(
                  "w-full px-4 py-2 rounded-lg font-semibold transition-colors mb-6",
                  pkg.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                Choose {pkg.name}
              </button>

              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6 flex-1">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Instructions */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-8 border border-green-200 dark:border-green-800">
          <h2 className="font-display font-bold text-xl mb-4 text-green-900 dark:text-green-100">
            Payment Information
          </h2>

          <div className="space-y-4 text-green-900 dark:text-green-100">
            <div>
              <h4 className="font-semibold mb-1">M-Pesa Paybill</h4>
              <p className="text-lg font-mono font-bold">400200</p>
              <p className="text-sm mt-1 opacity-75">Account: Your Property ID</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded text-gray-900 dark:text-white">
              <h4 className="font-semibold mb-2 text-sm">Quick Steps:</h4>
              <ol className="space-y-1 text-xs list-decimal list-inside opacity-75">
                <li>Select "Lipa na M-Pesa Online"</li>
                <li>Code: 400200, Reference: Your ID</li>
                <li>Enter amount based on package</li>
                <li>Confirm transaction</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-8 border border-purple-200 dark:border-purple-800">
          <h2 className="font-display font-bold text-xl mb-4 text-purple-900 dark:text-purple-100">
            Need Help?
          </h2>

          <p className="text-purple-900 dark:text-purple-100 mb-6">
            Our team is ready to help you choose the right package and guide you through the setup process.
          </p>

          <WhatsAppButton
            message="Hi! I need help choosing a listing package for my property."
            label="Chat with Support"
            variant="card"
          />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Feature
              </th>
              {LISTING_PACKAGES.map((pkg) => (
                <th
                  key={pkg.id}
                  className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white"
                >
                  {pkg.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Photos", values: ["5", "20", "30", "Unlimited"] },
              { label: "Visibility Period", values: ["30 days", "90 days", "6 months", "1 year"] },
              { label: "Verification Badge", values: ["No", "Yes", "Yes", "Yes"] },
              { label: "Featured Placement", values: ["No", "No", "Yes", "Yes"] },
              { label: "Email Marketing", values: ["No", "No", "Yes", "Yes"] },
              { label: "Video Support", values: ["No", "No", "No", "Yes"] },
            ].map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                  {row.label}
                </td>
                {row.values.map((value, valIdx) => (
                  <td key={valIdx} className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
