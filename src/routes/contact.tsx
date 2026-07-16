import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageCircle, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — KejaHub" }, { name: "description", content: "Get in touch with the KejaHub team. We respond within a few hours during business days." }] }),
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("requests").insert({
        requester_id: auth.user?.id ?? "00000000-0000-0000-0000-000000000000",
        type: "contact",
        message: `${subject} | From: ${name} (${email}) | ${message}`,
      });
      if (error) throw error;
      toast.success("Message sent — we'll be in touch shortly.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you" description="Questions, feedback or partnership ideas — the KejaHub team is here to help." />
      <section className="container-app py-14 grid gap-10 lg:grid-cols-[1fr_400px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-semibold">Name</label><Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
            <div><label className="text-sm font-semibold">Email</label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
          </div>
          <div><label className="text-sm font-semibold">Subject</label><Input required value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" /></div>
          <div><label className="text-sm font-semibold">Message</label><Textarea rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" /></div>
          <Button type="submit" size="lg" disabled={submitting} className="gradient-primary text-primary-foreground">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send message"}
          </Button>
        </form>

        <aside className="space-y-4">
          {[
            { i: Mail, t: "Email", v: "hello@kejahub.co.ke" },
            { i: Phone, t: "Phone", v: "+254 700 000 000" },
            { i: MapPin, t: "Office", v: "Westlands, Nairobi, Kenya" },
          ].map((c) => (
            <div key={c.t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><c.i className="h-5 w-5" /></div>
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">{c.t}</p>
                <p className="mt-0.5 font-medium">{c.v}</p>
              </div>
            </div>
          ))}
          <WhatsAppButton
            variant="card"
            label="WhatsApp Us"
            message="Hello KejaHub, I'd like to get in touch."
          />
        </aside>
      </section>
    </>
  );
}
