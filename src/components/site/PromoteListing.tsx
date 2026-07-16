import { Star, TrendingUp, Eye, Wallet, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const benefits = [
  { icon: Eye, title: "Homepage placement", desc: "Your listing appears on the KejaHub homepage" },
  { icon: TrendingUp, title: "Higher search ranking", desc: "Boost to the top of search results" },
  { icon: Star, title: "More visibility", desc: "Featured badge and premium placement" },
];

const promotionPlans = [
  { key: "7days", label: "7 Days", price: "KSh 2,500", desc: "Quick boost" },
  { key: "30days", label: "30 Days", price: "KSh 7,500", desc: "Best value" },
  { key: "90days", label: "90 Days", price: "KSh 18,000", desc: "Maximum exposure" },
];

export function PromoteListing({ propertyId, propertyTitle }: { propertyId?: string; propertyTitle?: string }) {
  const [loading, setLoading] = useState(false);

  const promote = async (plan: string) => {
    setLoading(true);
    if (propertyId) {
      const days = plan === "7days" ? 7 : plan === "30days" ? 30 : 90;
      const until = new Date();
      until.setDate(until.getDate() + days);

      const { error } = await supabase
        .from("properties")
        .update({
          featured: true,
          featured_until: until.toISOString(),
        })
        .eq("id", propertyId);

      if (error) {
        setLoading(false);
        toast.error("Failed to promote listing. Please try again.");
        return;
      }
    }
    setLoading(false);
    toast.success(`Listing promoted for ${plan === "7days" ? "7 days" : plan === "30days" ? "30 days" : "90 days"}! Pay via M-Pesa to complete.`);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2">
        <Star className="h-5 w-5 text-warning" /> Promote Listing
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Boost your listing's visibility and reach more buyers.</p>

      {/* Benefits */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-xl border border-border p-4">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-warning/15 text-warning">
              <b.icon className="h-4 w-4" />
            </div>
            <p className="mt-2 font-semibold text-sm">{b.title}</p>
            <p className="text-xs text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {promotionPlans.map((p) => (
          <div key={p.key} className="rounded-xl border-2 border-border p-4 text-center hover:border-primary/40 transition-colors">
            <p className="font-semibold text-sm">{p.label}</p>
            <p className="font-display text-2xl font-bold text-primary mt-1">{p.price}</p>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
            <Button
              size="sm"
              className="mt-3 w-full gradient-primary text-primary-foreground"
              disabled={loading}
              onClick={() => promote(p.key)}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Promote"}
            </Button>
          </div>
        ))}
      </div>

      {/* Payment instructions */}
      <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Payment Instructions</p>
        <p className="mt-1">Pay via M-Pesa to Paybill <span className="font-mono font-semibold">400200</span>, Account: <span className="font-mono font-semibold">KEJAHUB-PROMOTE</span></p>
        <p className="mt-0.5">Include your listing ID in the account reference for faster processing.</p>
      </div>
    </div>
  );
}
