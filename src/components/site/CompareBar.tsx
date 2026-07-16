import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GitCompare, X } from "lucide-react";
import { properties } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

const KEY = "keja_compare";

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
  }, []);
  const save = (v: string[]) => { setIds(v); localStorage.setItem(KEY, JSON.stringify(v)); };
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => save(ids.includes(id) ? ids.filter(x => x !== id) : ids.length >= 3 ? ids : [...ids, id]),
    clear: () => save([]),
  };
}

export function CompareBar() {
  const { ids, toggle, clear } = useCompare();
  if (ids.length === 0) return null;
  const items = properties.filter(p => ids.includes(p.id));
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl rounded-2xl border border-border bg-card/95 backdrop-blur shadow-elegant p-3 flex items-center gap-3 animate-fade-up">
      <GitCompare className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-lg border border-border bg-background pl-1 pr-2 py-1 shrink-0">
            <img src={p.images[0]} alt="" className="h-8 w-10 rounded object-cover" />
            <span className="text-xs font-medium max-w-[120px] truncate">{p.title}</span>
            <button onClick={() => toggle(p.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <Button asChild size="sm" className="gradient-primary text-primary-foreground shrink-0">
        <Link to="/compare">Compare ({items.length})</Link>
      </Button>
      <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground shrink-0">Clear</button>
    </div>
  );
}
