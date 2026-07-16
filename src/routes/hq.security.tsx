import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { securityEvents } from "@/lib/hq-data";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const sevColor = { low: "bg-success/10 text-success", medium: "bg-warning/15 text-warning-foreground", high: "bg-destructive/10 text-destructive" } as const;

export const Route = createFileRoute("/hq/security")({
  head: () => ({ meta: [{ title: "Security — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Security Dashboard" description="Login alerts, fraud signals and activity logs.">
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[{ l: "Failed logins (24h)", v: 37 }, { l: "New device alerts", v: 9 }, { l: "Blocked accounts", v: 4 }].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="mt-3 font-display text-3xl font-bold">{k.v}</p>
            <p className="text-sm text-muted-foreground">{k.l}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-3">
        {securityEvents.map((e) => (
          <li key={e.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">{e.kind}</p>
              <p className="text-xs text-muted-foreground">{e.who} · {e.where} · {e.when}</p>
            </div>
            <span className={cn("rounded-full px-2 py-1 text-xs font-semibold capitalize", sevColor[e.severity as keyof typeof sevColor])}>{e.severity}</span>
          </li>
        ))}
      </ul>
    </HQPage>
  ),
});
