import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  variant?: "floating" | "inline" | "card";
  className?: string;
}

const WHATSAPP_NUMBER = "254700000000";

export function WhatsAppButton({
  message,
  label = "Contact on WhatsApp",
  variant = "inline",
  className,
}: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(whatsappUrl, "_blank");
  };

  if (variant === "floating") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "fixed bottom-6 right-6 bg-success hover:bg-success/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover-lift z-40",
          className
        )}
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-success text-success rounded-lg hover:bg-success/5 transition-colors duration-200",
          className
        )}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
      </button>
    );
  }

  // inline variant
  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-medium transition-colors duration-200",
        className
      )}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </button>
  );
}
