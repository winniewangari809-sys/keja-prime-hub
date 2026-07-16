import { Check, X, Camera, MapPin, DollarSign, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface HealthCheck {
  key: string;
  label: string;
  icon: typeof Camera;
  done: boolean;
}

export function PropertyHealthScore({
  photosCount,
  hasLocation,
  hasPrice,
  hasDescription,
  hasAmenities,
}: {
  photosCount: number;
  hasLocation: boolean;
  hasPrice: boolean;
  hasDescription: boolean;
  hasAmenities: boolean;
}) {
  const checks: HealthCheck[] = [
    { key: "photos", label: "Photos Added", icon: Camera, done: photosCount > 0 },
    { key: "location", label: "Location Added", icon: MapPin, done: hasLocation },
    { key: "price", label: "Price Added", icon: DollarSign, done: hasPrice },
    { key: "description", label: "Description Added", icon: FileText, done: hasDescription },
    { key: "amenities", label: "Amenities Added", icon: Sparkles, done: hasAmenities },
  ];

  const completed = checks.filter((c) => c.done).length;
  const score = Math.round((completed / checks.length) * 100);

  const scoreColor =
    score >= 80 ? "text-success" : score >= 50 ? "text-warning-foreground" : "text-destructive";
  const scoreBg =
    score >= 80 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
        Property Health Score
      </h3>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative grid h-20 w-20 place-items-center shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={cn(scoreColor, "transition-all duration-500")}
              strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            />
          </svg>
          <span className={cn("font-display text-2xl font-bold", scoreColor)}>{score}%</span>
        </div>
        <div>
          <p className="font-semibold text-sm">
            {score >= 80 ? "Excellent!" : score >= 50 ? "Good progress" : "Needs work"}
          </p>
          <p className="text-xs text-muted-foreground">
            {completed} of {checks.length} checks completed. {score >= 80 ? "Your listing is ready to publish." : "Complete the remaining items to improve visibility."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                c.done ? "border-success/30 bg-success/5" : "border-border",
              )}
            >
              <span className={cn("grid h-7 w-7 place-items-center rounded-lg shrink-0", c.done ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground")}>
                {c.done ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </span>
              <Icon className={cn("h-4 w-4 shrink-0", c.done ? "text-success" : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium", c.done ? "text-foreground" : "text-muted-foreground")}>
                {c.label}
              </span>
              {c.key === "photos" && (
                <span className="ml-auto text-xs text-muted-foreground">{photosCount}/20</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
