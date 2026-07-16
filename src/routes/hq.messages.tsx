import { createFileRoute } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { messagesQueue } from "@/lib/hq-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/messages")({
  head: () => ({ meta: [{ title: "Messages — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Messages" description="All conversations across the marketplace.">
      {messagesQueue.length === 0 ? <EmptyState /> : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {messagesQueue.map((m) => (
            <div key={m.id} className={cn("p-4 hover:bg-secondary/40 flex items-start gap-4", m.unread && "bg-primary/5")}>
              <span className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-primary-foreground text-sm font-bold">{m.from[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{m.from} <span className="text-xs font-normal text-muted-foreground">· {m.about}</span></p>
                <p className="text-sm text-muted-foreground truncate">{m.preview}</p>
              </div>
              <span className="text-xs text-muted-foreground">{m.when}</span>
            </div>
          ))}
        </div>
      )}
    </HQPage>
  ),
});
