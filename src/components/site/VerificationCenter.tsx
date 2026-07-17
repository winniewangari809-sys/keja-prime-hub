import { CircleCheck as CheckCircle } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { cn } from "@/lib/utils";

interface VerificationTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  documents: string[];
  popular?: boolean;
}

const VERIFICATION_TIERS: VerificationTier[] = [
  {
    id: "basic",
    name: "Basic Listing",
    price: 0,
    description: "Get started with a free listing",
    features: [
      "Free property listing",
      "Up to 5 photos",
      "Basic details",
      "Contact form",
    ],
    documents: [],
  },
  {
    id: "verified",
    name: "Verified Property",
    price: 1500,
    description: "Build trust with verification",
    features: [
      "Everything in Basic",
      "Blue verified badge",
      "Higher search ranking",
      "Verification seal",
      "Priority support",
    ],
    documents: ["National ID", "Property deed/lease", "Proof of ownership"],
    popular: true,
  },
  {
    id: "featured",
    name: "Featured Property",
    price: 3000,
    description: "Stand out from the crowd",
    features: [
      "Everything in Verified",
      "Featured badge & placement",
      "Top search results",
      "Highlighted listing",
      "Social media promotion",
    ],
    documents: [
      "National ID",
      "Property deed/lease",
      "Proof of ownership",
      "Recent photos",
    ],
  },
  {
    id: "premium",
    name: "Premium Property",
    price: 5000,
    description: "Maximum visibility",
    features: [
      "Everything in Featured",
      "Premium placement",
      "Homepage featured",
      "Concierge support",
      "Virtual tour hosting",
      "Monthly reports",
    ],
    documents: [
      "National ID",
      "Property deed/lease",
      "Proof of ownership",
      "Professional photos",
      "Property inspection report",
    ],
  },
];

export function VerificationCenter() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-4xl mb-4">
          Verification Center
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Increase your credibility and visibility with our verification tiers
        </p>
      </div>

      {/* Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {VERIFICATION_TIERS.map(tier => (
          <div
            key={tier.id}
            className={cn(
              "relative rounded-lg border transition-all duration-200",
              tier.popular
                ? "border-primary shadow-elegant lg:scale-105 bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}

            <div className="p-6">
              <h3 className="font-display font-bold text-xl mb-2">
                {tier.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {tier.description}
              </p>

              <div className="mb-6">
                <span className="font-display font-bold text-3xl">
                  KSh {tier.price.toLocaleString()}
                </span>
                {tier.price > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    one-time fee
                  </p>
                )}
              </div>

              <button
                className={cn(
                  "w-full px-4 py-2 rounded-lg font-semibold transition-colors mb-6",
                  tier.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                Get {tier.name}
              </button>

              <div className="space-y-3 mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {tier.documents.length > 0 && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm mb-3">Required Documents</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {tier.documents.map((doc, idx) => (
                      <li key={idx}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="font-display font-bold text-2xl mb-4 text-blue-900 dark:text-blue-100">
          Payment Instructions
        </h2>

        <div className="space-y-4 text-blue-900 dark:text-blue-100 mb-6">
          <div>
            <h3 className="font-semibold mb-2">M-Pesa Paybill:</h3>
            <p className="text-lg font-mono font-bold">400200</p>
            <p className="text-sm mt-1">Account: Your Property ID</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded mt-4">
            <h4 className="font-semibold mb-2">Steps:</h4>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Go to M-Pesa menu and select "Lipa na M-Pesa Online"</li>
              <li>Enter Business Code: 400200</li>
              <li>Enter Account Reference: Your Property ID</li>
              <li>Enter the amount for your selected tier</li>
              <li>Complete the transaction</li>
              <li>Your verification will be activated within 24 hours</li>
            </ol>
          </div>
        </div>

        <WhatsAppButton
          message="Hi! I need help with the verification process for my property."
          label="Get Help with Verification"
          variant="card"
        />
      </div>
    </div>
  );
}
