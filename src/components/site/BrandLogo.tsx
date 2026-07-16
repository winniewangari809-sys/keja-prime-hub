import { cn } from "@/lib/utils";

/** Interactive, animated KejaHub logo. Pure CSS, respects reduced motion. */
export function BrandLogo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="brand-mark relative grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft overflow-hidden">
        <span className="brand-emoji brand-emoji-1">🔍</span>
        <span className="brand-emoji brand-emoji-2">🏠</span>
        <span className="brand-emoji brand-emoji-3">🏢</span>
        <span className="brand-emoji brand-emoji-4">✈️</span>
        <span className="brand-glow" aria-hidden />
      </span>
      {showWordmark && (
        <span className="font-display text-xl font-bold tracking-tight">
          Keja<span className="text-primary">Hub</span>
        </span>
      )}
    </span>
  );
}
