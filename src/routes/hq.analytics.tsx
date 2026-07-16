import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { heatMap } from "@/lib/hq-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/hq/analytics")({
  head: () => ({ meta: [{ title: "Analytics — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Growth Analytics" description="Traffic, funnels and area intelligence.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { l: "Sessions (7d)", v: "42,180" },
          { l: "Signups (7d)",  v: "918"    },
          { l: "Listing views", v: "128k"   },
          { l: "Conversion",    v: "3.2%"   },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-3xl font-bold">{k.v}</p>
            <p className="text-sm text-muted-foreground">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold mb-4">🔥 Property heat map</h3>
        <ul className="space-y-3">
          {heatMap.map((h) => (
            <li key={h.area} className="flex items-center gap-4">
              <span className="w-32 font-semibold">{h.area}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full gradient-primary" style={{ width: `${h.score}%` }} />
              </div>
              <span className="text-sm font-semibold w-10 text-right">{h.score}</span>
              {h.trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
              {h.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
              {h.trend === "flat" && <Minus className="h-4 w-4 text-muted-foreground" />}
            </li>
          ))}
        </ul>
      </div>
    </HQPage>
  ),
});
