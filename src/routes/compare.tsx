import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { properties, priceLabel } from "@/lib/mock-data";
import { useCompare } from "@/components/site/CompareBar";
import { waterReliability } from "@/lib/premium-copy";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare properties — KejaHub" }, { name: "description", content: "Compare properties side-by-side on rent, amenities, security and water reliability." }] }),
  component: Compare,
});

function Compare() {
  const { ids, clear } = useCompare();
  const items = properties.filter(p => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Compare" title="Nothing to compare yet" description="Add up to 3 properties from any listing page to see them side by side." />
        <section className="container-app py-16 text-center">
          <Button asChild className="gradient-primary text-primary-foreground"><Link to="/rentals">Browse rentals</Link></Button>
        </section>
      </>
    );
  }

  const rows: { label: string; get: (p: any) => React.ReactNode }[] = [
    { label: "Location",  get: p => p.location },
    { label: "Price",     get: p => <span className="font-semibold text-primary">{priceLabel(p)}</span> },
    { label: "Bedrooms",  get: p => p.bedrooms ?? "—" },
    { label: "Bathrooms", get: p => p.bathrooms ?? "—" },
    { label: "Size",      get: p => p.size ?? "—" },
    { label: "Parking",   get: p => p.parking ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" /> },
    { label: "Water reliability", get: p => "★".repeat(waterReliability(p)) + "☆".repeat(5 - waterReliability(p)) },
    { label: "Security score",    get: p => p.neighborhood?.scores?.security ?? "—" },
    { label: "Convenience",       get: p => p.neighborhood?.scores?.convenience ?? "—" },
    { label: "Amenities",         get: p => (p.amenities?.slice(0,4).join(", ")) || p.features.slice(0,3).join(", ") },
  ];

  return (
    <>
      <PageHeader eyebrow="Compare" title={`Comparing ${items.length} properties`} description="Everything you need to decide, side by side." />
      <section className="container-app py-10">
        <div className="mb-4 flex justify-end"><Button variant="outline" size="sm" onClick={clear}>Clear all</Button></div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm bg-card">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left w-40">Property</th>
                {items.map((p) => (
                  <th key={p.id} className="p-4 text-left min-w-[220px]">
                    <Link to="/property/$slug" params={{ slug: p.slug }} className="block">
                      <img src={p.images[0]} alt="" className="h-24 w-full rounded-lg object-cover mb-2" />
                      <p className="font-semibold text-sm hover:text-primary">{p.title}</p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border last:border-0">
                  <td className="p-4 font-semibold text-muted-foreground">{r.label}</td>
                  {items.map((p) => <td key={p.id} className="p-4">{r.get(p)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
