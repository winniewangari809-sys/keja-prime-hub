import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { revenueVault } from "@/lib/hq-data";
import { formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/hq/revenue")({
  head: () => ({ meta: [{ title: "Revenue — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const total = revenueVault.sources.reduce((s, r) => s + r.value, 0);
    return (
      <HQPage title="Revenue Center" description="Every stream, every shilling — in one view.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Today", v: revenueVault.today },
            { l: "This week", v: revenueVault.week },
            { l: "This month", v: revenueVault.month },
            { l: "This year", v: revenueVault.year },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase text-muted-foreground">{k.l}</p>
              <p className="mt-2 font-display text-2xl font-bold">{formatKES(k.v)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold mb-4">Revenue sources · {formatKES(total)}</h3>
          <div className="space-y-3">
            {revenueVault.sources.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1"><span>{s.label}</span><span className="font-semibold">{formatKES(s.value)}</span></div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full gradient-primary" style={{ width: `${(s.value / revenueVault.sources[0].value) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </HQPage>
    );
  },
});
