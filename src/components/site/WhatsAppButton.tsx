import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const KEJAHUB_WHATSAPP = "254700000000";

function buildWaLink(message: string) {
  return `https://wa.me/${KEJAHUB_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  variant?: "floating" | "inline" | "card";
  className?: string;
}

export function WhatsAppButton({
  message = "Hello KejaHub, I have a question.",
  label = "WhatsApp KejaHub",
  variant = "inline",
  className,
}: WhatsAppButtonProps) {
  if (variant === "floating") {
    return <FloatingWhatsApp defaultMessage={message} />;
  }

  if (variant === "card") {
    return (
      <a
        href={buildWaLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-3 rounded-xl border-2 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-4 hover:border-emerald-500 transition-colors",
          className,
        )}
      >
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-white shrink-0">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">{label}</p>
          <p className="text-xs text-muted-foreground">Chat with KejaHub Concierge</p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={buildWaLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

function FloatingWhatsApp({ defaultMessage }: { defaultMessage: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-elegant animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white">
                <MessageCircle className="h-4 w-4" />
              </span>
              <p className="font-semibold text-sm">KejaHub Concierge</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Need help? Chat with KejaHub HQ directly on WhatsApp. We typically respond within minutes.
          </p>
          <a
            href={buildWaLink(defaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Start Chat
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-elegant hover:bg-emerald-600 transition-colors animate-fade-up"
        aria-label="WhatsApp KejaHub"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
