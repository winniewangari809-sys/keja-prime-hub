import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Handshake, Calendar, ShieldCheck, Loader as Loader2, Phone, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export function ConciergeInquiryPanel({ listing, propertyId, ownerId }: {
  listing: string;
  propertyId?: string;
  ownerId?: string;
}) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);
  const auth = useAuth();

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold">KejaHub Concierge</p>
          <p className="text-xs text-muted-foreground">All inquiries are handled by our HQ team. Your contact info stays private.</p>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full gradient-primary text-primary-foreground"
        onClick={() => {
          if (!auth.user) {
            toast.error("Please sign in to submit an inquiry.");
            return;
          }
          setInquiryOpen(true);
        }}
      >
        <Handshake className="h-4 w-4" /> Interested In Property
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={() => {
          if (!auth.user) {
            toast.error("Please sign in to schedule a viewing.");
            return;
          }
          setViewingOpen(true);
        }}
      >
        <Calendar className="h-4 w-4" /> Schedule Viewing
      </Button>

      <WhatsAppButton
        variant="card"
        label="WhatsApp KejaHub Concierge"
        message={`Hello KejaHub, I am interested in "${listing}".`}
        className="w-full"
      />

      <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
        All communication flows through KejaHub HQ. We coordinate viewings and inquiries on your behalf.
      </p>

      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        listing={listing}
        propertyId={propertyId}
        ownerId={ownerId}
        userId={auth.user?.id}
      />
      <ViewingDialog
        open={viewingOpen}
        onOpenChange={setViewingOpen}
        listing={listing}
        propertyId={propertyId}
        ownerId={ownerId}
        userId={auth.user?.id}
      />
    </div>
  );
}

function InquiryDialog({ open, onOpenChange, listing, propertyId, ownerId, userId }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: string;
  propertyId?: string;
  ownerId?: string;
  userId?: string;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState("phone");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!fullName || !phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("concierge_requests").insert({
      requester_id: userId,
      type: "inquiry",
      property_id: propertyId ?? null,
      full_name: fullName,
      phone_number: phone,
      email: email || null,
      preferred_contact: contactMethod,
      message: message || `Inquiry about ${listing}`,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to submit inquiry. Please try again.");
      return;
    }
    toast.success("Your inquiry has been sent to KejaHub HQ. We'll be in touch soon.");
    onOpenChange(false);
    setFullName(""); setPhone(""); setEmail(""); setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Interested In Property</DialogTitle>
        <DialogDescription>Submit your details — KejaHub HQ will coordinate with the property owner on your behalf.</DialogDescription>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Phone Number</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">Email (optional)</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Preferred Contact Method</label>
            <div className="mt-2 flex gap-2">
              {[
                { key: "phone", label: "Phone", icon: Phone },
                { key: "email", label: "Email", icon: Mail },
                { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setContactMethod(m.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors",
                    contactMethod === m.key ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
                  )}
                >
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Message</label>
            <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I'd like to know more about this property..." className="mt-1" />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit Inquiry"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Your contact information is visible only to KejaHub HQ Admin — not to the property owner.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ViewingDialog({ open, onOpenChange, listing, propertyId, ownerId, userId }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: string;
  propertyId?: string;
  ownerId?: string;
  userId?: string;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!date || !time || !phone) {
      toast.error("Please fill in date, time, and phone number.");
      return;
    }
    setLoading(true);

    // Insert the viewing
    const { data: viewingData, error: viewingError } = await supabase.from("viewings").insert({
      requester_id: userId,
      property_id: propertyId ?? null,
      owner_id: ownerId ?? null,
      property_title: listing,
      preferred_date: date,
      preferred_time: time,
      phone_number: phone,
      notes: notes || null,
      status: "pending",
    }).select().single();

    if (viewingError) {
      setLoading(false);
      toast.error("Failed to schedule viewing. Please try again.");
      return;
    }

    // Create notifications: buyer gets confirmation, admin gets alert, seller gets notified (without buyer info)
    const notifications = [
      // Buyer notification
      {
        user_id: userId,
        title: "Viewing request submitted",
        body: `Your viewing request for "${listing}" on ${date} at ${time} has been submitted. KejaHub HQ will confirm shortly.`,
        kind: "viewing",
      },
      // Admin notification
      {
        role: "hq" as const,
        title: "Viewing request awaiting action",
        body: `New viewing request for "${listing}" on ${date} at ${time}. Review and coordinate.`,
        kind: "viewing",
      },
    ];

    // If there's an owner, notify them too (without buyer contact info)
    if (ownerId) {
      notifications.push({
        user_id: ownerId,
        title: "New viewing request",
        body: `A viewing request has been submitted for "${listing}" on ${date} at ${time}. KejaHub HQ will coordinate the details.`,
        kind: "viewing",
      } as any);
    }

    await supabase.from("notifications").insert(notifications);

    setLoading(false);
    toast.success("Viewing request submitted! KejaHub HQ will coordinate and confirm with you soon.");
    onOpenChange(false);
    setDate(""); setTime(""); setPhone(""); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Schedule Viewing</DialogTitle>
        <DialogDescription>Request a viewing — KejaHub HQ will coordinate with the property owner and confirm with you.</DialogDescription>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Property</p>
            <p className="font-semibold text-sm">{listing}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Preferred Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">Preferred Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-semibold">Additional Notes (optional)</label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." className="mt-1" />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit Viewing Request"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Your phone number is visible only to KejaHub HQ Admin. The property owner will not see your contact details.
        </p>
      </DialogContent>
    </Dialog>
  );
}
