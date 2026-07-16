import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useState, type ReactNode } from "react";

export function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <p className="text-sm font-semibold mb-3">{label}</p>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

export function FiltersSidebar({ children, onReset }: { children: ReactNode; onReset?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="lg:hidden flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
        {onReset && <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>}
      </div>

      <aside className="hidden lg:block w-72 shrink-0">
        <div className="rounded-2xl border border-border bg-card p-5 sticky top-24">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold">Filters</h3>
            {onReset && <button onClick={onReset} className="text-xs text-primary hover:underline">Reset</button>}
          </div>
          {children}
        </div>
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur">
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-card p-5 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold">Filters</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
            <Button className="mt-4 w-full gradient-primary text-primary-foreground" onClick={() => setOpen(false)}>Show results</Button>
          </div>
        </div>
      )}
    </>
  );
}
