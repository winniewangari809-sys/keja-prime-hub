import { properties } from "@/lib/mock-data";
import { PropertyCard } from "./PropertyCard";
import { ShieldCheck } from "lucide-react";

export function TrustedProperties() {
  const trusted = properties.filter(p => p.verified && (p.verificationTier === "gold" || p.verificationTier === "platinum")).slice(0, 3);
  if (trusted.length === 0) return null;
  return (
    <section className="container-app py-16 md:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Trusted properties
        </p>
        <h2 className="mt-2 font-display text-2xl md:text-4xl font-bold text-balance">Gold & Platinum verified — extra peace of mind</h2>
        <p className="mt-2 text-muted-foreground">These sellers have completed our highest verification tiers.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trusted.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
