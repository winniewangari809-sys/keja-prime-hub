import { TrendingUp, CircleCheck as CheckCircle } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";

interface PromotionPlan {
  duration: string;
  durationDays: number;
  price: number;
  benefits: string[];
  popular?: boolean;
}

const PROMOTION_PLANS: PromotionPlan[] = [
  {
    duration: "7 Days",
    durationDays: 7,
    price: 2500,
    benefits: [
      "Prominent listing placement",
      "Daily visibility boost",
      "Social media highlighting",
      "Email campaign inclusion",
    ],
  },
  {
    duration: "30 Days",
    durationDays: 30,
    price: 7500,
    benefits: [
      "All from 7-day plan",
      "Extended visibility",
      "Multiple email campaigns",
      "Premium search ranking",
      "Featured badge on listing",
    ],
    popular: true,
  },
  {
    duration: "90 Days",
    durationDays: 90,
    price: 18000,
    benefits: [
      "All from 30-day plan",
      "Maximum visibility period",
      "Weekly email campaigns",
      "Social media promotion",
      "Custom landing page",
      "Monthly performance report",
    ],
  },
];

export function PromoteListing() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-4xl">Promote Your Listing</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Boost your property visibility and attract more buyers, tenants, or guests
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROMOTION_PLANS.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-lg border transition-all duration-200 ${
              plan.popular
                ? "border-primary shadow-elegant lg:scale-105 bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}

            <div className="p-6">
              <h3 className="font-display font-bold text-2xl mb-2">
                {plan.duration}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {plan.durationDays} days of promotion
              </p>

              <div className="mb-6">
                <span className="font-display font-bold text-3xl">
                  KSh {plan.price.toLocaleString()}
                </span>
              </div>

              <button
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors mb-6 ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Select Plan
              </button>

              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                {plan.benefits.map((benefit, benefitIdx) => (
                  <div key={benefitIdx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Instructions */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-8 border border-amber-200 dark:border-amber-800">
        <h2 className="font-display font-bold text-2xl mb-4 text-amber-900 dark:text-amber-100">
          How to Promote Your Listing
        </h2>

        <div className="space-y-4 text-amber-900 dark:text-amber-100 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded">
            <h4 className="font-semibold mb-2">M-Pesa Payment (Paybill 400200):</h4>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Go to M-Pesa and select "Lipa na M-Pesa Online"</li>
              <li>Business Code: 400200</li>
              <li>Account Reference: Your Property ID</li>
              <li>Amount: Select based on your chosen plan</li>
              <li>Promotion starts within 1 hour of payment</li>
            </ol>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded">
            <h4 className="font-semibold mb-2">What Happens After Payment:</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Your listing gets premium placement</li>
              <li>Appears in promotional emails and social media</li>
              <li>Increased visibility in search results</li>
              <li>Daily performance updates in your dashboard</li>
            </ul>
          </div>
        </div>

        <WhatsAppButton
          message="Hi! I want to promote my property listing. Can you help?"
          label="Chat About Promotion"
          variant="card"
        />
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-2xl">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {[
            {
              q: "When does promotion start?",
              a: "Promotion starts within 1 hour of successful payment confirmation.",
            },
            {
              q: "Can I renew a promotion?",
              a: "Yes! You can renew promotion at any time before the current period ends.",
            },
            {
              q: "What if I want to cancel?",
              a: "Contact our support team. Refunds are available for unused promotion time.",
            },
            {
              q: "How do I track performance?",
              a: "Your dashboard shows real-time views, clicks, and inquiries during promotion.",
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">{item.q}</h4>
              <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
