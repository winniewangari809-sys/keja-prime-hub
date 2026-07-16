import { ShieldCheck, FileText, Award, CreditCard, Info, Loader as Loader2, CircleCheck as CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const verificationTiers = [
  { tier: "Bronze", fee: "KSh 500", color: "text-amber-800 bg-amber-100", perks: ["Phone verified badge", "Basic listing exposure"] },
  { tier: "Silver", fee: "KSh 1,500", color: "text-slate-800 bg-slate-200", perks: ["ID verified badge", "Priority in search"] },
  { tier: "Gold", fee: "KSh 3,000", color: "text-yellow-900 bg-yellow-100", perks: ["Trusted Seller badge", "Better analytics", "Concierge priority"] },
  { tier: "Platinum", fee: "KSh 5,000", color: "text-primary bg-primary/10", perks: ["Featured in Trusted Properties", "Top exposure", "VIP support"] },
];

const requiredDocuments = [
  "National ID or Passport (front and back)",
  "KRA PIN certificate",
  "Proof of property ownership (title deed, lease agreement, or letter of administration)",
  "Recent utility bill matching the property address",
  "One passport-size photo",
];

const verificationSteps = [
  "Choose a verification tier below",
  "Submit the required documents",
  "Pay the verification fee via M-Pesa to Paybill 400200, Account: KEJAHUB-VERIFY",
  "Our team reviews your documents within 48 hours",
  "Once approved, your verified badge appears on all your listings",
];

export function VerificationCenter({ userId }: { userId?: string }) {
  const [status, setStatus] = useState<string>("unverified");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.avatar_url?.startsWith("verified:")) {
            setStatus(data.avatar_url.replace("verified:", ""));
          }
        });
    }
  }, [userId]);

  const requestVerification = async (tier: string) => {
    setLoading(true);
    // Store verification request in admin_settings as a key-value pair
    if (userId) {
      await supabase.from("concierge_requests").insert({
        requester_id: userId,
        type: "inquiry",
        full_name: "Verification Request",
        phone_number: "N/A",
        message: `Verification request for ${tier} tier. Documents pending submission.`,
      });
    }
    setLoading(false);
    toast.success(`${tier} verification request submitted! Upload your documents and pay the fee to complete verification.`);
  };

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Verification Status
        </h3>
        <div className="mt-4 flex items-center gap-4">
          <div className={cn(
            "grid h-14 w-14 place-items-center rounded-full",
            status !== "unverified" ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
          )}>
            {status !== "unverified" ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
          </div>
          <div>
            <p className="font-semibold capitalize">
              {status === "unverified" ? "Not Verified" : `${status} Verified`}
            </p>
            <p className="text-sm text-muted-foreground">
              {status === "unverified"
                ? "Get verified to earn trust badges and higher visibility."
                : "Your account is verified. Enjoy premium benefits."}
            </p>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Required Documents
        </h3>
        <ul className="mt-4 space-y-2 text-sm">
          {requiredDocuments.map((doc, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Verification Benefits */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> Verification Benefits
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {verificationTiers.map((t) => (
            <div key={t.tier} className="rounded-xl border border-border p-4 hover-lift">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", t.color)}>
                <ShieldCheck className="h-3.5 w-3.5" /> {t.tier}
              </span>
              <ul className="mt-3 space-y-1 text-xs">
                {t.perks.map((p) => <li key={p} className="flex gap-1.5"><span className="text-primary">•</span>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Fee */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> Verification Fee
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {verificationTiers.map((t) => (
            <div key={t.tier} className="rounded-xl border-2 border-border p-4 text-center hover:border-primary/40 transition-colors">
              <p className="font-display text-2xl font-bold text-primary">{t.fee}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.tier} tier</p>
              <Button
                size="sm"
                className="mt-3 w-full gradient-primary text-primary-foreground"
                disabled={loading}
                onClick={() => requestVerification(t.tier)}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Get ${t.tier}`}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Payment Instructions:</p>
          <p className="mt-1">Pay via M-Pesa to Paybill <span className="font-mono font-semibold">400200</span>, Account: <span className="font-mono font-semibold">KEJAHUB-VERIFY</span></p>
          <p className="mt-1">Or pay via bank transfer: Equity Bank, Account <span className="font-mono font-semibold">0110XXXXXXX</span>, Branch: Westlands</p>
        </div>
      </div>

      {/* Verification Instructions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" /> Verification Instructions
        </h3>
        <ol className="mt-4 space-y-3 text-sm">
          {verificationSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full gradient-primary text-primary-foreground text-xs font-bold shrink-0">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
