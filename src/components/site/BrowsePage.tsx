import { useMemo, useState, type ReactNode } from "react";
import { properties, type PropertyCategory } from "@/lib/mock-data";
import { PageHeader } from "@/components/site/PageHeader";
import { ListingGrid } from "@/components/site/ListingGrid";
import { FiltersSidebar, FilterGroup } from "@/components/site/FiltersSidebar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface BrowsePageProps {
  category: PropertyCategory | PropertyCategory[];
  eyebrow: string;
  title: string;
  description?: string;
  extraFilters?: (state: any, setState: (u: any) => void) => ReactNode;
  applyExtra?: (p: any, state: any) => boolean;
}

export function BrowsePage({ category, eyebrow, title, description, extraFilters, applyExtra }: BrowsePageProps) {
  const cats = Array.isArray(category) ? category : [category];
  const [q, setQ] = useState("");
  const [budget, setBudget] = useState<number>(0);
  const [beds, setBeds] = useState<number | "any">("any");
  const [baths, setBaths] = useState<number | "any">("any");
  const [sort, setSort] = useState("newest");
  const [extra, setExtra] = useState<any>({});

  const all = properties.filter((p) => cats.includes(p.category));
  const maxBudget = Math.max(...all.map((p) => p.price));

  const results = useMemo(() => {
    let list = all.filter((p) => {
      if (q && !`${p.title} ${p.location}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (budget && p.price > budget) return false;
      if (beds !== "any" && (p.bedrooms ?? 0) < beds) return false;
      if (baths !== "any" && (p.bathrooms ?? 0) < baths) return false;
      if (applyExtra && !applyExtra(p, extra)) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // Always prioritize listings with video tours
    list = [...list].sort((a, b) => Number(!!b.video) - Number(!!a.video));
    return list;
  }, [all, q, budget, beds, baths, sort, extra, applyExtra]);

  const reset = () => { setQ(""); setBudget(0); setBeds("any"); setBaths("any"); setExtra({}); };

  const filters = (
    <>
      <FilterGroup label="Location">
        <Input placeholder="Search area" value={q} onChange={(e) => setQ(e.target.value)} />
      </FilterGroup>
      <FilterGroup label={`Budget: ${budget ? "KSh " + budget.toLocaleString() : "Any"}`}>
        <Slider min={0} max={maxBudget} step={Math.max(1, Math.round(maxBudget / 100))} value={[budget]} onValueChange={(v) => setBudget(v[0])} />
      </FilterGroup>
      {(cats.includes("rental") || cats.includes("sale") || cats.includes("airbnb")) && (
        <>
          <FilterGroup label="Bedrooms">
            <div className="flex flex-wrap gap-2">
              {(["any", 1, 2, 3, 4, 5] as const).map((n) => (
                <button key={n} onClick={() => setBeds(n)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${beds === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {n === "any" ? "Any" : `${n}+`}
                </button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup label="Bathrooms">
            <div className="flex flex-wrap gap-2">
              {(["any", 1, 2, 3, 4] as const).map((n) => (
                <button key={n} onClick={() => setBaths(n)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${baths === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {n === "any" ? "Any" : `${n}+`}
                </button>
              ))}
            </div>
          </FilterGroup>
        </>
      )}
      {extraFilters?.(extra, setExtra)}
    </>
  );

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="container-app py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSidebar onReset={reset}>{filters}</FiltersSidebar>
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{results.length}</span> properties found</p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ListingGrid items={results} />
          </div>
        </div>
      </section>
    </>
  );
}

// helper for extra checkbox filters
export function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span>{label}</span>
    </label>
  );
}
