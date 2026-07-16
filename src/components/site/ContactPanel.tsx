import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageCircle, PhoneCall, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

function mask(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "+254 ••• •••";
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6).replace(/./g, "•")} ••• ${digits.slice(-3)}`;
}

export function ContactPanel({ ownerName, ownerPhone, listing, propertyId, ownerId }: { ownerName: string; ownerPhone: string; listing: string; propertyId?: string; ownerId?: string }) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [shared, setShared] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth();

  async function saveRequest(type: string, msg: string) {
    if (!auth.user) {
      toast.error("Please sign in to contact the owner.");
      return false;
    }
    const { error } = await supabase.from("requests").insert({
      requester_id: auth.user.id,
      owner_id: ownerId ?? null,
      property_id: propertyId ?? null,
      type,
      message: msg,
    });
    if (error) {
      toast.error("Failed to save request");
      return false;
    }
    return true;
  }

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Owner contact</p>
          <p className="mt-0.5 font-mono text-sm">{mask(ownerPhone)}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
          <ShieldCheck className="h-3 w-3" /> Private
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={async () => {
          const ok = await saveRequest("viewing", `Viewing request for ${listing}`);
          if (ok) { setRequested(true); toast.success(`Request sent to ${ownerName} — they'll unlock their number if they choose.`); }
        }} disabled={requested}>
          <PhoneCall className="h-4 w-4" /> {requested ? "Requested" : "Request Contact"}
        </Button>
        <Button size="sm" variant="outline" onClick={async () => {
          const ok = await saveRequest("contact", `Shared number with ${ownerName} for ${listing}`);
          if (ok) { setShared(true); toast.success("Your number has been shared with the owner."); }
        }} disabled={shared}>
          <Share2 className="h-4 w-4" /> {shared ? "Shared" : "Share My Number"}
        </Button>
      </div>

      <Button size="lg" className="w-full gradient-primary text-primary-foreground" onClick={() => setMsgOpen(true)}>
        <MessageCircle className="h-4 w-4" /> Send Private Message
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        🔒 Your personal information remains private and is only shared when you choose to share it.
      </p>

      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent>
          <DialogTitle>Message {ownerName}</DialogTitle>
          <DialogDescription>About: {listing}</DialogDescription>
          <Textarea rows={5} placeholder="Hi, I'm interested in this property…" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button
            className="gradient-primary text-primary-foreground"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              const ok = await saveRequest("inquiry", message || `Inquiry about ${listing}`);
              if (ok) { setMsgOpen(false); setMessage(""); toast.success("Message sent — the owner will reply here."); }
              setSubmitting(false);
            }}
          >
            Send message
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
