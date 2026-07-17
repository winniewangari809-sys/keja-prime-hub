import { CircleCheck as CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  label: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    id: "request-sent",
    label: "Request Sent",
    description: "Your interest has been registered",
  },
  {
    id: "reviewing",
    label: "KejaHub Reviewing",
    description: "Our team is reviewing your request",
  },
  {
    id: "viewing-scheduled",
    label: "Viewing Scheduled",
    description: "Property viewing has been arranged",
  },
  {
    id: "viewing-completed",
    label: "Viewing Completed",
    description: "You've completed the property viewing",
  },
  {
    id: "negotiation",
    label: "Negotiation",
    description: "Price and terms being negotiated",
  },
  {
    id: "deal-closed",
    label: "Deal Closed",
    description: "Congratulations! Transaction complete",
  },
];

interface BuyerStatusTrackerProps {
  currentStage: "request-sent" | "reviewing" | "viewing-scheduled" | "viewing-completed" | "negotiation" | "deal-closed";
}

export function BuyerStatusTracker({ currentStage }: BuyerStatusTrackerProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl mb-2">Purchase Progress</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Track your journey to securing your new property
        </p>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.id} className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200",
                    isCompleted
                      ? "bg-success text-white"
                      : isCurrent
                        ? "bg-primary text-white ring-4 ring-primary/30"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {idx < STAGES.length - 1 && (
                  <div
                    className={cn(
                      "w-1 h-12 transition-colors duration-200",
                      isCompleted || isCurrent
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn(
                "pb-8 flex-1",
                isCurrent && "pt-1"
              )}>
                <h4 className={cn(
                  "font-semibold text-lg transition-colors duration-200",
                  isCompleted
                    ? "text-success"
                    : isCurrent
                      ? "text-primary"
                      : "text-gray-500 dark:text-gray-500"
                )}>
                  {stage.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stage.description}
                </p>

                {isCurrent && (
                  <div className="mt-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30 dark:border-primary/40">
                    <p className="text-sm font-semibold text-primary dark:text-primary">
                      You are here
                    </p>
                    <p className="text-xs text-primary/70 dark:text-primary/60 mt-1">
                      Our team is working to move you to the next stage
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Progress: {currentIndex + 1} of {STAGES.length} stages
          </span>
          <div className="flex-1 ml-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / STAGES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
