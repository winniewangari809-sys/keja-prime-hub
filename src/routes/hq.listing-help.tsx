import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { helpRequestsSeed, helpKindMeta } from "@/lib/help-requests";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/hq/listing-help")({
  head: () => ({ meta: [{ title: "Listing Assistance — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => <ListingHelp />,
});

const statusTone = {
  new:           "bg-warning/20 text-warning-foreground",
  "in-progress": "bg-primary/10 text-primary",
  done:          "bg-success/15 text-success",
} as const;

function ListingHelp() {
  const [requests, setRequests] = useState(helpRequestsSeed);
  const act = (id: string, status: "in-progress" | "done", label: string) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r));
    toast.success(label);
  };

  return (
    <HQPage title="Listing Assistance Center" description="Help sellers create high-quality listings. Every request lands here.">
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Request</th>
              <th className="p-4">Seller</th>
              <th className="p-4 hidden md:table-cell">Location</th>
              <th className="p-4 hidden md:table-cell">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
                <td className="p-4">
                  <p className="font-semibold flex items-center gap-2">{helpKindMeta[r.kind].emoji} {helpKindMeta[r.kind].label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">"{r.message}"</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold">{r.user}</p>
                  <p className="text-xs text-muted-foreground font-mono">{r.phone}</p>
                </td>
                <td className="p-4 hidden md:table-cell text-xs">{r.location ?? "—"}</td>
                <td className="p-4 hidden md:table-cell text-xs text-muted-foreground">{r.submitted}</td>
                <td className="p-4"><span className={cn("rounded-full px-2 py-1 text-xs font-semibold capitalize", statusTone[r.status])}>{r.status.replace("-", " ")}</span></td>
                <td className="p-4 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => act(r.id, "in-progress", "Marked in progress")} className="mr-2">Contact</Button>
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => act(r.id, "done", "Resolved ✅")}>Publish</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HQPage>
  );
}
