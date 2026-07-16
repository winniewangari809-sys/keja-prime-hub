import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { HelpCircle, X } from "lucide-react";
import { toast } from "sonner";
import { helpKindMeta, type HelpRequestKind } from "@/lib/help-requests";
import { cn } from "@/lib/utils";

const kinds: HelpRequestKind[] = [
  "list-property",
  "upload-photos",
  "write-listing",
  "find-house",
  "verify-account",
  "contact-support",
];

// HQ pages hide the FAB per product rules.
const HIDDEN_PREFIXES = ["/dashboard/admin", "/hq"];

export function HelpFab() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))) return null;

  const send = (kind: HelpRequestKind) => {
    setOpen(false);
    toast.success(`🎉 We got it! KejaHub will help you with "${helpKindMeta[kind].label}".`);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
        {open && (
          <div className="w-72 rounded-2xl border border-border bg-card shadow-elegant animate-scale-in overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-display text-base font-bold">🙋 How can we help?</p>
              <p className="text-xs text-muted-foreground">Pick one — we'll reach out.</p>
            </div>
            <ul className="p-2">
              {kinds.map((k) => (
                <li key={k}>
                  <button
                    onClick={() => send(k)}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-accent transition-colors"
                  >
                    <span className="text-lg">{helpKindMeta[k].emoji}</span>
                    <span className="text-sm font-medium">{helpKindMeta[k].label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            "grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-elegant hover:scale-105 transition-transform",
            open && "rotate-90"
          )}
          aria-label={open ? "Close help" : "Need help?"}
        >
          {open ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}
