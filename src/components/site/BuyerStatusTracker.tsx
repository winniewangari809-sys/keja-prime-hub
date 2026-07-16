import { Send, Eye, Calendar, CheckCircle2, Handshake, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { key: "request_sent", label: "Request Sent", icon: Send, desc: "Your inquiry has been submitted to KejaHub HQ" },
  { key: "reviewing", label: "KejaHub Reviewing", icon: Eye, desc: "Our team is reviewing your request" },
  { key: "viewing_scheduled", label: "Viewing Scheduled", icon: Calendar, desc: "A viewing has been arranged" },
  { key: "viewing_completed", label: "Viewing Completed", icon: CheckCircle2, desc: "You've visited the property" },
  { key: "negotiation", label: "Negotiation", icon: Handshake, desc: "KejaHub is negotiating on your behalf" },
  { key: "deal_closed", label: "Deal Closed", icon: Trophy, desc: "Congratulations! The deal is complete" },
];

const stageOrder = ["request_sent", "reviewing", "viewing_scheduled", "viewing_completed", "negotiation", "deal_closed"];

export function BuyerStatusTracker({ currentStage }: { currentStage?: string }) {
  const activeIndex = currentStage ? stageOrder.indexOf(currentStage) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold mb-2">Your Journey</h3>
      <p className="text-sm text-muted-foreground mb-6">Track your property journey from request to deal closure.</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {stages.map((stage, i) => {
            const isComplete = i < activeIndex;
            const isActive = i === activeIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="relative flex items-start gap-4">
                <div
                  className={cn(
                    "relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 transition-colors shrink-0",
                    isComplete
                      ? "border-success bg-success text-white"
                      : isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="pt-1.5">
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      isActive ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
