import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "buyer",
    label: "Buyer",
    description: "Looking to purchase a property",
    group: "find",
  },
  {
    id: "tenant",
    label: "Tenant",
    description: "Looking to rent a property",
    group: "find",
  },
  {
    id: "seller",
    label: "Seller",
    description: "Selling your property",
    group: "list",
  },
  {
    id: "landlord",
    label: "Landlord",
    description: "Renting out your property",
    group: "list",
  },
  {
    id: "agent",
    label: "Real Estate Agent",
    description: "Professional property broker",
    group: "list",
  },
  {
    id: "airbnb",
    label: "Airbnb Host",
    description: "Short-term rental host",
    group: "list",
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Commercial property owner",
    group: "list",
  },
];

export function GoldenHero() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<"find" | "list" | null>(null);
  const navigate = useNavigate();

  const handleGetStarted = (intent: "find" | "list") => {
    setSelectedIntent(intent);
    setShowRoleModal(true);
  };

  const handleRoleSelect = (roleId: string) => {
    navigate({
      to: "/signup",
      search: { role: roleId, intent: selectedIntent },
    });
  };

  const filteredRoles = selectedIntent
    ? ROLES.filter(role => role.group === selectedIntent)
    : [];

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48" />

      {/* Content */}
      <div className="relative container-app py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-6 border border-primary/30">
            <Home className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Welcome to KejaHub
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-up">
            <span className="text-gray-900 dark:text-white">Find Your Perfect</span>
            <br />
            <span className="gradient-primary bg-clip-text text-transparent">
              Property in Kenya
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up animation-delay-100">
            Whether you're looking for a home, listing a property, or running a business, KejaHub connects you with the right opportunities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up animation-delay-200">
            <button
              onClick={() => handleGetStarted("find")}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all duration-200 hover-lift shadow-soft hover:shadow-elegant"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Find a Property
            </button>

            <button
              onClick={() => handleGetStarted("list")}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg font-semibold transition-all duration-200 hover-lift"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              List a Property
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 animate-fade-up animation-delay-300">
            {[
              { label: "Active Listings", value: "5,000+" },
              { label: "Happy Users", value: "50,000+" },
              { label: "Transactions", value: "10,000+" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="font-display font-bold text-2xl md:text-3xl text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full p-8">
            <h2 className="font-display font-bold text-2xl mb-4">
              {selectedIntent === "find"
                ? "What are you looking for?"
                : "How will you use KejaHub?"}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedIntent === "find"
                ? "Select your profile to find the right property"
                : "Choose your profile to list and manage properties"}
            </p>

            {/* Role Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 text-left hover-lift"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {role.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {role.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
              >
                Back
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => navigate({ to: "/login" })}
                  className="text-primary hover:text-primary/90 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
