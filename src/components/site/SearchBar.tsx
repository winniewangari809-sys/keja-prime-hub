import { Search, MapPin, Home, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const rotating = ["🔍 Search Kilimani…", "🏠 House in Runda", "🏢 Apartment in Ruiru", "🏬 Office in Westlands", "✈️ Airbnb in Diani", "🏠 KejaHub"];

export function SearchBar() {
  const navigate = useNavigate();
  const [loc, setLoc] = useState("");
  const [type, setType] = useState("rental");
  const [budget, setBudget] = useState("");
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % rotating.length), 2200);
    return () => clearInterval(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const path =
      type === "rental" ? "/rentals" :
      type === "airbnb" ? "/airbnbs" :
      type === "sale" ? "/homes-for-sale" : "/commercial-property";
    navigate({ to: path, search: { q: loc || undefined, budget: budget || undefined } as any });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card shadow-elegant p-2 sm:p-3 grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]"
    >
      <label className="flex items-center gap-3 rounded-xl bg-background px-4 py-3 border border-transparent focus-within:border-primary/40 focus-within:bg-accent/40">
        <MapPin className="h-5 w-5 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">Where</p>
          <input
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            placeholder={loc ? "City, area or estate" : rotating[phIdx]}
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/70 transition-all"
          />
        </div>
      </label>

      <label className="flex items-center gap-3 rounded-xl bg-background px-4 py-3 border border-transparent focus-within:border-primary/40">
        <Home className="h-5 w-5 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">Property Type</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          >
            <option value="rental">Rental</option>
            <option value="airbnb">Airbnb</option>
            <option value="sale">Home for Sale</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </label>

      <label className="flex items-center gap-3 rounded-xl bg-background px-4 py-3 border border-transparent focus-within:border-primary/40">
        <Wallet className="h-5 w-5 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">Budget</p>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Max KSh"
            inputMode="numeric"
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
          />
        </div>
      </label>

      <Button type="submit" size="lg" className="gradient-primary text-primary-foreground h-full min-h-14 rounded-xl shadow-soft">
        <Search className="h-5 w-5" />
        <span className="ml-1">Search</span>
      </Button>
    </form>
  );
}
