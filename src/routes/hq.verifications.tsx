import { createFileRoute } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { verificationQueue } from "@/lib/hq-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/verifications")({
  head: () => ({ meta: [{ title: "Verifications — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <HQPage title="Verification Center" description="Approve or reject KYC and property proofs.">
      {verificationQueue.length === 0 ? <EmptyState /> : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Tier</th><th className="p-4">Submitted</th><th className="p-4"></th></tr>
            </thead>
            <tbody>
              {verificationQueue.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="p-4 font-semibold">{v.name}</td>
                  <td className="p-4">{v.type}</td>
                  <td className="p-4 capitalize">{v.tier}</td>
                  <td className="p-4 text-muted-foreground">{v.submitted}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Approved ${v.name}`)}>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.error(`Rejected ${v.name}`)}>Reject</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </HQPage>
  ),
});
