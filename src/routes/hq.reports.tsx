import { createFileRoute } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { reportsQueue } from "@/lib/hq-data";
import { Flag } from "lucide-react";

export const Route = createFileRoute("/hq/reports")({
  head: () => ({ meta: [{ title: "Reports — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Reported Listings" description="Investigate and take down offenders.">
      {reportsQueue.length === 0 ? <EmptyState /> : (
        <ul className="space-y-3">
          {reportsQueue.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/10 text-destructive"><Flag className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="font-semibold">{r.listing}</p>
                <p className="text-sm text-muted-foreground">Reason: {r.reason} · by {r.by}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.when}</span>
            </li>
          ))}
        </ul>
      )}
    </HQPage>
  ),
});
