import type { Property } from "@/lib/mock-data";
import { appealScore, completeness, coachTips } from "@/lib/premium-copy";

export function listingQuality(p: Property) {
  const score = appealScore(p);
  if (score >= 80) return { label: "Excellent Listing", tone: "bg-success/15 text-success", emoji: "🌟" };
  if (score >= 55) return { label: "Good Listing",      tone: "bg-primary/10 text-primary", emoji: "✅" };
  return { label: "Needs Improvement", tone: "bg-warning/15 text-warning-foreground", emoji: "⚡" };
}

export function ListingQualityBadge({ p }: { p: Property }) {
  const q = listingQuality(p);
  const c = completeness(p);
  const tips = coachTips(p).slice(0, 3);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${q.tone}`}>
          {q.emoji} {q.label}
        </span>
        <span className="text-xs text-muted-foreground">{c}% complete</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full gradient-primary" style={{ width: `${c}%` }} />
      </div>
      {tips.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {tips.map(t => <li key={t}>• {t}</li>)}
        </ul>
      )}
    </div>
  );
}
