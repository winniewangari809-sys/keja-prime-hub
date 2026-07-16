import { properties } from "@/lib/mock-data";
import { appealScore } from "@/lib/premium-copy";
import { PropertyCard } from "./PropertyCard";
import { Sparkles } from "lucide-react";

export function HiddenGems() {
  const gems = [...properties]
    .filter(p => !p.featured)
    .map(p => ({ p, s: appealScore(p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(x => x.p);
  if (gems.length === 0) return null;
  return (
    <section className="container-app py-16 md:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Hidden gems
        </p>
        <h2 className="mt-2 font-display text-2xl md:text-4xl font-bold text-balance">Great homes most people haven't noticed yet</h2>
        <p className="mt-2 text-muted-foreground">High appeal scores, low views — get in before everyone else.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gems.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
