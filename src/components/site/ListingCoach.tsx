import type { Property } from "@/lib/mock-data";
import { appealScore, completeness, coachTips } from "@/lib/premium-copy";
import { Sparkles, TrendingUp } from "lucide-react";

export function ListingCoach({ p }: { p: Property }) {
  const score = appealScore(p);
  const comp = completeness(p);
  const tips = coachTips(p);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Listing coach</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{p.title}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ScoreBar label="Appeal score" value={score} tone="primary" />
        <ScoreBar label="Completeness" value={comp} tone="success" />
      </div>

      {tips.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {tips.map((t) => (
            <li key={t} className="flex items-start gap-2 rounded-lg bg-primary/5 p-2.5">
              <TrendingUp className="mt-0.5 h-4 w-4 text-primary shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreBar({ label, value, tone }: { label: string; value: number; tone: "primary" | "success" }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span className="font-semibold">{value}%</span></div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={tone === "primary" ? "h-full gradient-primary" : "h-full bg-success"} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
