import { ShieldCheck, TrendingUp, Sparkles, Crown } from "lucide-react";

const rewards = [
  { tier: "Bronze",   icon: ShieldCheck, color: "text-amber-800 bg-amber-100",   perks: ["Phone verified badge", "Basic listing exposure"] },
  { tier: "Silver",   icon: ShieldCheck, color: "text-slate-800 bg-slate-200",   perks: ["ID verified badge", "Priority in search"] },
  { tier: "Gold",     icon: TrendingUp,  color: "text-yellow-900 bg-yellow-100", perks: ["Trusted Seller badge", "Better analytics", "Concierge priority"] },
  { tier: "Platinum", icon: Crown,       color: "text-primary bg-primary/10",    perks: ["Featured in Trusted Properties", "Top exposure", "VIP support"] },
];

export function VerificationRewards() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Verification rewards</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Verified sellers earn more trust, better analytics, and higher visibility.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((r) => (
          <div key={r.tier} className="rounded-xl border border-border p-4 hover-lift">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${r.color}`}>
              <r.icon className="h-3.5 w-3.5" /> {r.tier}
            </span>
            <ul className="mt-3 space-y-1 text-sm">
              {r.perks.map((p) => <li key={p} className="flex gap-2"><span className="text-primary">•</span>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
