import type { Property } from "@/lib/mock-data";
import { whyLocation, lifestyleTags } from "@/lib/lifestyle-tags";
import { Sparkles } from "lucide-react";

export function LocationInsights({ p }: { p: Property }) {
  const why = whyLocation(p);
  const tags = lifestyleTags(p);
  return (
    <div className="mt-14">
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" /> Why this location?
      </h2>
      <p className="text-sm text-muted-foreground mt-1">Smart insights about what's around this property.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {why.map((w) => (
          <div key={w.text} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
            <span className="text-lg" aria-hidden>{w.icon}</span>
            <span>{w.text}</span>
          </div>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              ✨ {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
