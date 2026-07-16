import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Play, Ruler, ShieldCheck, Star, GitCompare, TrendingUp } from "lucide-react";
import { priceLabel, statusMeta, tierMeta, type Property } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { matchPercent, demandLevel } from "@/lib/premium-copy";
import { useCompare } from "@/components/site/CompareBar";
import { toast } from "sonner";

export function PropertyCard({ p }: { p: Property }) {
  const [saved, setSaved] = useState(false);
  const { has, toggle } = useCompare();
  const inCompare = has(p.id);
  const match = matchPercent(p);
  const demand = demandLevel(p);
  const demandTone = demand === "High" ? "bg-destructive/15 text-destructive" : demand === "Medium" ? "bg-warning/15 text-warning-foreground" : "bg-secondary text-muted-foreground";

  return (
    <Link
      to="/property/$slug"
      params={{ slug: p.slug }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card hover-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={p.images[0]}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {p.status && p.status !== "available" && (
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-soft backdrop-blur", statusMeta[p.status].color)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta[p.status].dot)} />
                {statusMeta[p.status].label}
              </span>
            )}
            {p.featured && (
              <span className="rounded-full bg-warning px-2.5 py-1 text-[11px] font-semibold text-warning-foreground shadow-soft">
                ★ Featured
              </span>
            )}
            {p.verified && p.verificationTier && (
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-soft capitalize", tierMeta[p.verificationTier].color)}>
                <ShieldCheck className="h-3 w-3" /> {p.verificationTier}
              </span>
            )}
            {p.video && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft backdrop-blur">
                🎥 Video Tour
              </span>
            )}
            {p.airbnbBadges?.includes("Super Host") && (
              <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-soft">
                ⭐ Super Host
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
              className="grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur text-foreground shadow-soft hover:scale-110 transition-transform"
              aria-label="Save"
            >
              <Heart className={cn("h-4 w-4", saved && "fill-destructive text-destructive")} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); toggle(p.id); toast.success(inCompare ? "Removed from compare" : "Added to compare"); }}
              className={cn("grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur shadow-soft hover:scale-110 transition-transform", inCompare && "bg-primary text-primary-foreground")}
              aria-label="Compare"
            >
              <GitCompare className="h-4 w-4" />
            </button>
          </div>
        </div>
        {p.video && (
          <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            <Play className="h-3 w-3 fill-current" /> {p.video.duration}
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-bold text-primary-foreground shadow-soft">
            {match}% match
          </span>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold shadow-soft", demandTone)}>
            <TrendingUp className="h-3 w-3" /> {demand}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{p.category}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" /> 4.8
          </div>
        </div>
        <h3 className="mt-1 line-clamp-1 font-display font-semibold text-base group-hover:text-primary transition-colors">
          {p.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {p.location}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {p.bedrooms !== undefined && (
            <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms || "Studio"}</span>
          )}
          {p.bathrooms !== undefined && (
            <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms}</span>
          )}
          {p.size && (
            <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.size}</span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="font-display text-lg font-bold text-foreground">{priceLabel(p)}</p>
          </div>
          <span className="text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
