import { PropertyCard } from "./PropertyCard";
import type { Property } from "@/lib/mock-data";

export function ListingGrid({ items }: { items: Property[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-2xl">
        <p className="text-lg font-semibold">No properties match your filters</p>
        <p className="mt-2 text-sm text-muted-foreground">Try clearing some filters or expanding your search.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <div key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-up">
          <PropertyCard p={p} />
        </div>
      ))}
    </div>
  );
}
