import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Hop as Home, Search, Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function GoldenHero() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"find" | "list">("find");

  const openModal = (mode: "find" | "list") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <section className="relative overflow-hidden border-b border-border hero-premium">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div className="container-app relative py-14 md:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Kenya's simplest property app
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold text-balance leading-[1.05]">
            What would you like to do today?
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Two taps and you're on your way — list a home you own, or find a home you'll love.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 max-w-3xl">
          <GoldenCard
            onClick={() => openModal("find")}
            title="Find a Property"
            body="Rentals · Airbnbs · Homes for sale"
            accent="from-emerald-500 to-cyan-500"
            icon={<Search className="h-4 w-4" />}
          />
          <GoldenCard
            onClick={() => openModal("list")}
            title="List a Property"
            body="Free · Takes about 2 minutes"
            accent="from-primary to-primary-glow"
            icon={<Home className="h-4 w-4" />}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Popular areas:</span>
          {["Kilimani", "Ruiru", "Diani", "Runda", "Nakuru", "Westlands"].map((c) => (
            <Link key={c} to="/rentals" className="rounded-full glass-card px-3 py-1 hover:text-primary transition-colors">
              {c}
            </Link>
          ))}
        </div>
      </div>

      <RoleSignupModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} />
    </section>
  );
}

function GoldenCard({ onClick, title, body, accent, icon }: {
  onClick: () => void; title: string; body: string; accent: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-4 md:p-5 text-white shadow-elegant hover-lift block text-left w-full`}
    >
      <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:scale-125" />
      <div className="relative flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg md:text-xl font-bold">{title}</h2>
          <p className="text-xs md:text-sm text-white/85">{body}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 transition-all group-hover:translate-x-1" />
      </div>
    </button>
  );
}

const findRoles = [
  { key: "buyer", label: "Buyer", emoji: "🏠", desc: "Find a home to buy" },
  { key: "tenant", label: "Tenant", emoji: "🔑", desc: "Find a place to rent" },
] as const;

const listRoles = [
  { key: "landlord", label: "Landlord", emoji: "🏘", desc: "List and manage rentals" },
  { key: "agent", label: "Agent", emoji: "💼", desc: "Represent multiple listings" },
  { key: "seller", label: "Seller", emoji: "🏢", desc: "Sell your property" },
  { key: "airbnb", label: "Airbnb Owner", emoji: "🏨", desc: "List short-stay properties" },
  { key: "commercial", label: "Commercial Owner", emoji: "🏬", desc: "List offices, shops, warehouses" },
] as const;

function RoleSignupModal({ open, onOpenChange, mode }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "find" | "list";
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const roles = mode === "find" ? findRoles : listRoles;
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleCreateAccount = () => {
    const roleParam = selectedRole ?? roles[0].key;
    onOpenChange(false);
    navigate({ to: "/signup", search: { role: roleParam } as any });
  };

  const handleLogin = () => {
    onOpenChange(false);
    navigate({ to: "/login" });
  };

  // If user is already logged in, skip the modal and go to browse/listing
  if (auth.user && open) {
    onOpenChange(false);
    if (mode === "find") {
      navigate({ to: "/rentals" });
    } else {
      navigate({ to: "/post-listing" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="font-display text-2xl font-bold">
          {mode === "find" ? "Welcome to KejaHub" : "How would you like to list?"}
        </DialogTitle>
        <DialogDescription>
          {mode === "find" ? "How would you like to use KejaHub?" : "Choose your account type to get started."}
        </DialogDescription>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-md hover:bg-accent"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mt-4 space-y-2">
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setSelectedRole(r.key)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all w-full",
                selectedRole === r.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              )}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold text-sm">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.desc}</span>
              </div>
              <span className={cn(
                "grid h-6 w-6 place-items-center rounded-full border-2",
                selectedRole === r.key ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}>
                {selectedRole === r.key && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button onClick={handleCreateAccount} size="lg" className="w-full gradient-primary text-primary-foreground">
            Create Account
          </Button>
          <Button onClick={handleLogin} variant="outline" size="lg" className="w-full">
            Already Have Account? Login
          </Button>
        </div>

        {mode === "find" && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Buyer and Tenant registration only.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
