import { createFileRoute, Link } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { helpRequestsSeed, helpKindMeta } from "@/lib/help-requests";
import { reportsQueue } from "@/lib/hq-data";
import { Flag, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/hq/support")({
  head: () => ({ meta: [{ title: "Support Center — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Support Center" description="Everything users need help with — help requests, house-search assistance, and reports.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4"><LifeBuoy className="h-5 w-5 text-primary" /><h2 className="font-display font-semibold">Help & Search Requests</h2></div>
          <ul className="divide-y divide-border">
            {helpRequestsSeed.map((h) => (
              <li key={h.id} className="py-3 flex items-start gap-3">
                <span className="text-xl shrink-0">{helpKindMeta[h.kind].emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{helpKindMeta[h.kind].label}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.user} · {h.phone} · {h.submitted}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/hq/listing-help" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Open Listing Assistance →</Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4"><Flag className="h-5 w-5 text-destructive" /><h2 className="font-display font-semibold">Reports</h2></div>
          <ul className="divide-y divide-border">
            {reportsQueue.map((r) => (
              <li key={r.id} className="py-3">
                <p className="font-semibold text-sm">{r.listing}</p>
                <p className="text-xs text-muted-foreground">Reason: {r.reason} · by {r.by} · {r.when}</p>
              </li>
            ))}
          </ul>
          <Link to="/hq/reports" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Open Reports →</Link>
        </div>
      </div>
    </HQPage>
  ),
});
