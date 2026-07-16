import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { propertyRequests } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/property-requests")({
  head: () => ({ meta: [{ title: "Property Request Marketplace — KejaHub" }, { name: "description", content: "Post what you're looking for. Landlords, agents and owners will respond with matches." }] }),
  component: RequestsPage,
});

function RequestsPage() {
  const [type, setType] = useState("Rental");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user) {
      toast.error("Please sign in to post a request.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("requests").insert({
        requester_id: auth.user.id,
        type: type.toLowerCase(),
        message: `${description} | Location: ${location} | Budget: ${budget}`,
      });
      if (error) throw error;
      toast.success("Your request has been posted.");
      setLocation("");
      setBudget("");
      setDescription("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to post request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Marketplace" title="Property Request Marketplace" description="Tell the market what you're looking for — verified landlords, owners and agents will respond." />
      <section className="container-app py-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-6">Active requests</h2>
          <div className="space-y-3">
            {propertyRequests.map((r) => (
              <div key={r.id} className="group rounded-2xl border border-border bg-card p-5 hover-lift">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{r.type}</span>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.posted}</span>
                  <span className="text-xs text-muted-foreground">by {r.user}</span>
                </div>
                <p className="font-medium">{r.title}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>📍 {r.location}</span>
                    <span>💰 {r.budget}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {r.responses} responses</span>
                  </div>
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => toast.success("Response sent")}>
                    Respond
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-elegant"
          >
            <h3 className="font-display text-lg font-semibold">Post a request</h3>
            <p className="mt-1 text-sm text-muted-foreground">Free · takes 30 seconds</p>
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-semibold">What are you looking for?</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Rental", "Airbnb", "Home", "Commercial"].map((t) => (
                      <SelectItem key={t} value={t}>Looking for {t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Ruiru, Nairobi" className="mt-1" required />
              </div>
              <div>
                <label className="text-xs font-semibold">Budget (KSh)</label>
                <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 30,000" className="mt-1" required />
              </div>
              <div>
                <label className="text-xs font-semibold">Describe your ideal property</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 2-bedroom apartment, furnished, secure compound" className="mt-1" rows={3} required />
              </div>
              <Button type="submit" disabled={submitting} className="w-full gradient-primary text-primary-foreground" size="lg">
                {submitting ? "Posting…" : "Post request"}
              </Button>
            </div>
          </form>
        </aside>
      </section>
    </>
  );
}
