import { Package, Check, Loader as Loader2, Wallet, Star, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

const packages = [
  {
    key: "basic",
    name: "Basic Listing",
    icon: Package,
    price: "Free",
    color: "border-border",
    features: [
      "Standard listing exposure",
      "Up to 10 photos",
      "Basic search visibility",
      "Self-service support",
    ],
  },
  {
    key: "verified",
    name: "Verified Property",
    icon: Check,
    price: "KSh 1,500",
    color: "border-blue-500/40",
    features: [
      "Verified badge on listing",
      "Up to 15 photos",
      "Priority search ranking",
      "ID & ownership verified",
      "Email support",
    ],
  },
  {
    key: "featured",
    name: "Featured Property",
    icon: Star,
    price: "KSh 3,000",
    color: "border-amber-500/40",
    popular: true,
    features: [
      "Featured badge",
      "Homepage placement",
      "Higher search ranking",
      "Up to 20 photos",
      "Concierge priority",
      "Phone support",
    ],
  },
  {
    key: "premium",
    name: "Premium Property",
    icon: Crown,
    price: "KSh 5,000",
    color: "border-primary/40",
    features: [
      "Premium badge",
      "Top of search results",
      "Homepage spotlight",
      "Unlimited photos + video",
      "VIP concierge support",
      "Analytics dashboard",
      "Social media promotion",
    ],
  },
];

export function ListingPackages({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState(false);

  const purchasePackage = async (pkg: string) => {
    setLoading(true);
    if (userId) {
      await supabase.from("concierge_requests").insert({
        requester_id: userId,
        type: "inquiry",
        full_name: "Listing Package Request",
        phone_number: "N/A",
        message: `Listing package request: ${pkg}. Payment pending.`,
      });
    }
    setLoading(false);
    toast.success(`${pkg} package request submitted! Complete payment via M-Pesa to activate.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="font-display text-xl font-semibold">Listing Packages</h3>
      </div>
      <p className="text-sm text-muted-foreground">Choose a package that fits your needs. Upgrade anytime.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.key}
              className={cn(
                "relative rounded-2xl border-2 bg-card p-5 hover-lift",
                pkg.color,
                pkg.popular && "shadow-elegant",
              )}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full gradient-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground shadow-soft">
                  <Gem className="h-2.5 w-2.5" /> Most Popular
                </span>
              )}
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-sm">{pkg.name}</p>
              <p className="font-display text-2xl font-bold text-primary mt-1">{pkg.price}</p>
              <ul className="mt-4 space-y-1.5 text-xs">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 text-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className={cn("mt-4 w-full", pkg.popular ? "gradient-primary text-primary-foreground" : "")}
                variant={pkg.popular ? "default" : "outline"}
                disabled={loading}
                onClick={() => purchasePackage(pkg.name)}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Choose ${pkg.name.split(" ")[0]}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Payment Instructions</p>
        <p className="mt-1">Pay via M-Pesa to Paybill <span className="font-mono font-semibold">400200</span>, Account: <span className="font-mono font-semibold">KEJAHUB-PACKAGE</span></p>
      </div>

      <WhatsAppButton
        variant="card"
        label="Need Help Choosing a Package?"
        message="Hello KejaHub, I need help choosing a listing package."
      />
    </div>
  );
}
