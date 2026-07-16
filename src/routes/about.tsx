import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ShieldCheck, Users, Zap, Heart, Globe, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us — KejaHub" }, { name: "description", content: "KejaHub is Kenya's most trusted property marketplace — helping people find, rent, buy and lease with confidence." }] }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="Building Kenya's most trusted property marketplace" description="We connect people with homes, land, Airbnbs and commercial spaces they can trust — verified, transparent and hassle-free." />
      <section className="container-app py-16 grid gap-10 lg:grid-cols-2 items-center">
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" alt="" className="rounded-2xl aspect-[4/3] object-cover" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Our mission</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Property discovery, done right.</h2>
          <p className="mt-4 text-muted-foreground">
            KejaHub combines the best of Airbnb, Zillow, Property24 and Booking.com while raising the bar on simplicity, trust and speed. We're building the platform Kenyans deserve — modern, secure and beautifully designed.
          </p>
          <p className="mt-3 text-muted-foreground">
            Whether you're renting your first apartment, buying land upcountry, or listing a beachfront Airbnb, KejaHub gets you there faster.
          </p>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { i: Target, t: "Vision", b: "To become Africa's most loved property marketplace." },
            { i: Heart, t: "Values", b: "Trust, transparency, speed and human-first design." },
            { i: Globe, t: "Reach", b: "All 47 counties. From Diani to Eldoret to Kisumu." },
            { i: ShieldCheck, t: "Verified", b: "Every verified listing is reviewed by our team." },
            { i: Users, t: "Community", b: "12,000+ landlords, agents, owners and developers." },
            { i: Zap, t: "Fast", b: "Lightning-fast, mobile-first, built for Kenya." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-6 hover-lift">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft"><v.i className="h-5 w-5" /></div>
              <h3 className="mt-4 font-display font-semibold">{v.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.b}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
