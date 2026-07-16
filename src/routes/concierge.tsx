import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { conciergeServices, formatKES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Sparkles, ShieldCheck, Clock, Handshake, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/concierge")({
  head: () => ({
    meta: [
      { title: "KejaHub Concierge — Premium Property Services" },
      { name: "description", content: "Let the KejaHub team match, view and negotiate properties on your behalf. Premium paid services from KSh 1,999." },
      { property: "og:title", content: "KejaHub Concierge — Premium Property Services" },
      { property: "og:description", content: "Property match, assisted viewings and full concierge — done for you." },
    ],
  }),
  component: Concierge,
});

function Concierge() {
  return (
    <>
      <PageHeader
        eyebrow="✨ Premium paid service"
        title="KejaHub Concierge — done-for-you property help"
        description="Our team handles the search, viewings and negotiation so you don't have to. Transparent flat fees, no commission surprises."
      />
      <section className="container-app py-10 space-y-12">
        {/* Let KejaHub Find For Me */}
        <FindForMeForm />

        {/* Concierge services */}
        <div className="grid gap-6 md:grid-cols-3">
          {conciergeServices.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                "relative rounded-2xl border-2 bg-card p-6 hover-lift animate-fade-up",
                s.popular ? "border-primary shadow-elegant" : "border-border"
              )}
              style={{ animationDelay: `${i*80}ms` }}
            >
              {s.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full gradient-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-soft">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.tagline}</p>
              <p className="mt-6">
                {s.from && <span className="text-xs text-muted-foreground">Starting from </span>}
                <span className="font-display text-3xl font-bold text-primary">{formatKES(s.price)}</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => toast.success(`Request submitted for ${s.name} — we'll be in touch within 24h.`)}
                className={cn("mt-6 w-full", s.popular ? "gradient-primary text-primary-foreground" : "")}
                variant={s.popular ? "default" : "outline"}
              >
                Request {s.name.split(" ")[0]}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8 grid gap-6 md:grid-cols-3">
          {[
            { i: ShieldCheck, t: "Verified experts", d: "Vetted KejaHub reps with local expertise" },
            { i: Clock, t: "Fast turnaround", d: "First shortlist within 48 hours" },
            { i: Sparkles, t: "Transparent pricing", d: "Flat fees. No hidden commissions." },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground"><f.i className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">{f.t}</p>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Concierge services are premium paid features. See <Link to="/contact" className="text-primary hover:underline">Contact</Link> for enterprise or bulk enquiries.
        </p>
      </section>
    </>
  );
}

function FindForMeForm() {
  const auth = useAuth();
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!auth.user) {
      toast.error("Please sign in to submit a request.");
      return;
    }
    if (!phone) {
      toast.error("Please enter your phone number.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("concierge_requests").insert({
      requester_id: auth.user.id,
      type: "find_property",
      full_name: auth.fullName || auth.firstName || "User",
      phone_number: phone,
      budget: budget || null,
      location: location || null,
      property_type: propertyType || null,
      bedrooms: bedrooms || null,
      message: notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to submit request. Please try again.");
      return;
    }
    toast.success("Your request has been sent to KejaHub HQ! We'll contact you personally within 48 hours.");
    setBudget(""); setLocation(""); setPropertyType(""); setBedrooms(""); setNotes(""); setPhone("");
  };

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-primary-foreground">
          <Handshake className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Let KejaHub Find For Me</h2>
          <p className="text-sm text-muted-foreground">Tell us what you're looking for — our team will search and contact you personally.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold">Budget (KSh)</label>
          <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 50,000/month or 5,000,000 total" className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-semibold">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kilimani, Westlands" className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-semibold">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select type...</option>
            <option value="rental">Rental</option>
            <option value="sale">Home for Sale</option>
            <option value="airbnb">Airbnb</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Bedrooms</label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select bedrooms...</option>
            <option value="studio">Studio</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Notes</label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements..." className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Phone Number</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="mt-1" />
        </div>
      </div>

      <Button onClick={submit} disabled={loading} size="lg" className="mt-6 w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : <><Handshake className="mr-2 h-4 w-4" /> Submit Request</>}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Your request goes directly to KejaHub HQ. We'll contact you personally within 48 hours.
      </p>
    </div>
  );
}
