import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchBar } from "@/components/site/SearchBar";
import { categories, popularLocations, properties, propertyRequests } from "@/lib/mock-data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { TrustedProperties } from "@/components/site/TrustedProperties";
import { HiddenGems } from "@/components/site/HiddenGems";
import { GoldenHero } from "@/components/site/GoldenHero";
import { ShieldCheck, Users, Zap, Search, LockKeyhole, BadgeCheck, ArrowRight, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KejaHub — Find. Rent. Buy. Lease Property in Kenya" },
      { name: "description", content: "Search verified rentals, Airbnbs, homes for sale and commercial property across Kenya on KejaHub." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = properties.filter(p => p.featured).slice(0, 6);
  const verified = properties.filter(p => p.verified).slice(0, 3);
  const latest = [...properties].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  return (
    <>
      {/* 🥇 GOLDEN HERO — 10-second rule */}
      <GoldenHero />

      {/* Secondary search + stats strip */}
      <section className="container-app py-10 border-b border-border">
        <div className="max-w-4xl mx-auto animate-fade-up">
          <SearchBar />
        </div>
        <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          {[
            ["12,400+", "Verified listings"],
            ["3,200+", "Active landlords"],
            ["47", "Counties covered"],
            ["98%", "User satisfaction"],
          ].map(([n, l]) => (
            <div key={l} className="animate-fade-up">
              <dt className="font-display text-2xl md:text-3xl font-bold text-primary">{n}</dt>
              <dd className="text-xs md:text-sm text-muted-foreground mt-1">{l}</dd>
            </div>
          ))}
        </dl>
      </section>


      {/* CATEGORIES */}
      <section className="container-app py-16 md:py-20">
        <SectionHead eyebrow="Browse categories" title="Whatever you're searching for" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              key={c.key}
              to={c.href}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-border animate-fade-up hover-lift"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img src={c.image} alt={c.label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-display text-lg font-bold">{c.label}</h3>
                <p className="text-xs opacity-80 mt-0.5">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR LOCATIONS */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container-app py-16 md:py-20">
          <SectionHead eyebrow="Popular locations" title="Explore top spots in Kenya" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {popularLocations.map((l, i) => (
              <Link
                key={l.name}
                to="/rentals"
                className="group relative overflow-hidden rounded-xl aspect-[4/5] animate-fade-up hover-lift"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <img src={l.image} alt={l.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <p className="font-semibold text-sm">{l.name}</p>
                  <p className="text-[11px] opacity-80">{l.count.toLocaleString()} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-app py-16 md:py-20">
        <SectionHead eyebrow="Featured" title="Handpicked featured listings" linkTo="/rentals" linkLabel="View all" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* VERIFIED */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container-app py-16 md:py-20">
          <SectionHead eyebrow="Trusted" title="Verified listings you can trust" description="Every verified property has been reviewed by our team." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {verified.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      <TrustedProperties />

      <HiddenGems />

      {/* LATEST */}
      <section className="container-app py-16 md:py-20">
        <SectionHead eyebrow="Latest" title="Fresh on the market" linkTo="/rentals" linkLabel="See all latest" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* INVESTMENT */}
      <section className="container-app py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground p-8 md:p-14">
          <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
                <TrendingUp className="h-3.5 w-3.5" /> Investment Opportunities
              </span>
              <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-balance">
                Grow your wealth through smart property investment.
              </h2>
              <p className="mt-3 text-primary-foreground/85 max-w-lg">
                Off-plan developments, income-generating rentals, and prime property — curated for Kenyan investors.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link to="/homes-for-sale">Explore opportunities</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Avg. rental yield", value: "8.2%" },
                { label: "Land appreciation", value: "18% / yr" },
                { label: "Off-plan projects", value: "42" },
                { label: "Diaspora clients", value: "1,100+" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5">
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-primary-foreground/80 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container-app py-16 md:py-20">
        <SectionHead eyebrow="Why KejaHub" title="Built on trust, speed, and transparency" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified Listings", body: "Our team reviews every verified listing to prevent scams." },
            { icon: Users, title: "Direct Owner Contact", body: "No middlemen. Message or call the property owner directly." },
            { icon: Search, title: "Smart Search", body: "Powerful filters to find exactly what you need in seconds." },
            { icon: Zap, title: "Fast Discovery", body: "Beautiful, mobile-first browsing that loads instantly." },
            { icon: LockKeyhole, title: "Secure Platform", body: "End-to-end encryption and secure authentication." },
            { icon: BadgeCheck, title: "Trusted Marketplace", body: "Verified badges for owners, agents and developers." },
          ].map((f, i) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 hover-lift animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROPERTY REQUESTS PREVIEW */}
      <section className="bg-secondary/40 border-t border-border">
        <div className="container-app py-16 md:py-20">
          <SectionHead
            eyebrow="Property Requests"
            title="Can't find what you need? Post a request."
            description="Buyers and renters post exactly what they're looking for — agents and owners reply with matches."
            linkTo="/property-requests"
            linkLabel="View marketplace"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {propertyRequests.slice(0, 6).map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 hover-lift">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{r.type}</span>
                  <span className="text-[11px] text-muted-foreground">{r.posted}</span>
                </div>
                <p className="mt-3 font-medium text-sm">{r.title}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Budget: <span className="font-semibold text-foreground">{r.budget}</span></span>
                  <span>{r.responses} responses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEST MODE PREVIEW */}
      <section className="container-app py-12 border-t border-border">
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 md:p-8">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
              <Eye className="h-3.5 w-3.5" /> TEST MODE
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold">Preview Dashboards</h2>
            <p className="mt-1 text-sm text-muted-foreground">Test any dashboard without creating an account.</p>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {[
              { label: "Buyer", href: "/dashboard/buyer", icon: "🏠" },
              { label: "Tenant", href: "/dashboard/tenant", icon: "🔑" },
              { label: "Agent", href: "/dashboard/agent", icon: "💼" },
              { label: "Landlord", href: "/dashboard/landlord", icon: "🏘" },
              { label: "BnB", href: "/dashboard/admin", icon: "🏨" },
              { label: "Commercial", href: "/dashboard/admin", icon: "🏢" },
              { label: "Admin", href: "/dashboard/admin", icon: "🛡" },
            ].map((b) => (
              <Link
                key={b.label}
                to={b.href as any}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/40 hover:bg-accent transition-all"
                onClick={() => {
                  const roleMap: Record<string, string> = { Buyer: "buyer", Tenant: "tenant", Agent: "agent", Landlord: "landlord", BnB: "hq", Commercial: "admin", Admin: "admin" };
                  sessionStorage.setItem("kejahub-test-mode", roleMap[b.label] ?? "buyer");
                }}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-xs font-semibold">{b.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/preview" className="text-sm font-semibold text-primary hover:underline">View all previews →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-16 md:py-24">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-balance max-w-2xl mx-auto">
            Have a property to rent, sell or lease?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            List on KejaHub and reach thousands of verified buyers, renters and Airbnb guests.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-soft">
              <Link to="/post-listing">Post a Listing</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, description, linkTo, linkLabel }: { eyebrow: string; title: string; description?: string; linkTo?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 md:mb-12 flex items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl md:text-4xl font-bold text-balance">{title}</h2>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo as any} className="hidden md:inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
