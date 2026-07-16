import { createFileRoute } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { conciergeQueue } from "@/lib/hq-data";

export const Route = createFileRoute("/hq/concierge-requests")({
  head: () => ({ meta: [{ title: "Concierge Requests — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Concierge Requests" description="Match, viewing and premium bundle requests.">
      {conciergeQueue.length === 0 ? <EmptyState /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {conciergeQueue.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 hover-lift">
              <p className="text-xs font-semibold uppercase text-primary">{c.service}</p>
              <p className="mt-1 font-display text-lg font-semibold">{c.user} · {c.area}</p>
              <p className="text-sm text-muted-foreground">Budget: {c.budget}</p>
              <p className="mt-2 text-xs text-muted-foreground">Posted {c.posted}</p>
            </div>
          ))}
        </div>
      )}
    </HQPage>
  ),
});
