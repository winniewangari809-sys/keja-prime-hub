import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function FriendlyEmpty({
  emoji = "✨",
  title,
  description,
  ctaLabel,
  ctaTo,
  children,
}: {
  emoji?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 md:p-14 text-center animate-fade-up">
      <div className="text-5xl md:text-6xl">{emoji}</div>
      <h3 className="mt-4 font-display text-xl md:text-2xl font-bold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{description}</p>}
      {ctaTo && ctaLabel && (
        <Button asChild size="lg" className="mt-6 gradient-primary text-primary-foreground shadow-soft">
          <Link to={ctaTo as any}>{ctaLabel}</Link>
        </Button>
      )}
      {children}
    </div>
  );
}
