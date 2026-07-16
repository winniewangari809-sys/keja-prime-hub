import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Hop as Home, Briefcase, Check, Loader as Loader2, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { dashboardForRole, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — KejaHub" }, { name: "description", content: "Create a KejaHub account to save searches, contact owners and post listings." }] }),
  validateSearch: (s: Record<string, unknown>): { role?: string } => ({
    role: typeof s.role === "string" ? s.role : undefined,
  }),
  component: Signup,
});

const roles = [
  { key: "buyer",      label: "Buyer",           icon: Search,    emoji: "🏠", desc: "Find a home to buy" },
  { key: "tenant",     label: "Tenant",          icon: Home,      emoji: "🔑", desc: "Find a place to rent" },
  { key: "landlord",   label: "Landlord",        icon: Home,      emoji: "🏘", desc: "List and manage rentals" },
  { key: "seller",     label: "Seller",          icon: Building2, emoji: "🏢", desc: "Sell your property" },
  { key: "agent",      label: "Agent",           icon: Briefcase, emoji: "💼", desc: "Represent multiple listings" },
  { key: "airbnb",     label: "Airbnb Owner",    icon: Home,      emoji: "🏨", desc: "List short-stay properties" },
  { key: "commercial", label: "Commercial Owner", icon: Building2, emoji: "🏬", desc: "List offices, shops, warehouses" },
] as const;

interface PasswordCheck {
  label: string;
  test: (pw: string) => boolean;
}

const passwordChecks: PasswordCheck[] = [
  { label: "8+ characters", test: (pw) => pw.length >= 8 },
  { label: "Uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "Number", test: (pw) => /\d/.test(pw) },
  { label: "Special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  const passed = passwordChecks.filter((c) => c.test(pw)).length;
  if (pw.length === 0) return { score: 0, label: "", color: "bg-transparent" };
  if (passed <= 1) return { score: 20, label: "Very weak", color: "bg-red-500" };
  if (passed === 2) return { score: 40, label: "Weak", color: "bg-orange-500" };
  if (passed === 3) return { score: 60, label: "Fair", color: "bg-yellow-500" };
  if (passed === 4) return { score: 80, label: "Good", color: "bg-lime-500" };
  return { score: 100, label: "Strong", color: "bg-green-500" };
}

function Signup() {
  const navigate = useNavigate();
  const { role: roleParam } = useSearch({ from: "/signup" });
  const [step, setStep] = useState<0 | 1>(0);
  const [roleIdx, setRoleIdx] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-select role from search param
  useEffect(() => {
    if (roleParam) {
      const idx = roles.findIndex((r) => r.key === roleParam);
      if (idx >= 0) {
        setRoleIdx(idx);
        setStep(1);
      }
    }
  }, [roleParam]);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (strength.score < 60) {
      toast.error("Please choose a stronger password.");
      return;
    }
    setLoading(true);
    try {
      const chosenRole = roles[roleIdx].key as AppRole;
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`.trim(), phone, role: chosenRole },
        },
      });
      if (error) throw error;
      const userId = data.user?.id;
      let role: AppRole | null = chosenRole;
      if (userId) {
        const { data: r, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (!roleError && r?.role) {
          role = r.role as AppRole;
        }
      }
      toast.success("🎉 Welcome to KejaHub — let's find your next home.");
      navigate({ to: dashboardForRole(role) as any });
    } catch (err: any) {
      const msg = err?.message ?? "Signup failed";
      if (msg.includes("Invalid API key")) {
        toast.error("Supabase connection error: The API key doesn't match the project URL. Check .env — VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be from the same project.", { duration: 8000 });
      } else {
        toast.error(msg, { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-16 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></span>
            <span className="font-display text-xl font-bold">Keja<span className="text-primary">Hub</span></span>
          </Link>

          {step === 0 && (
            <div className="animate-fade-in">
              <h1 className="font-display text-3xl font-bold">What brings you to KejaHub?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Pick a role — we'll tailor your experience.</p>
              <div className="mt-8 grid gap-3">
                {roles.map((r, i) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRoleIdx(i)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all hover-lift",
                      roleIdx === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl">{r.emoji}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold">{r.label}</span>
                      <span className="block text-xs text-muted-foreground">{r.desc}</span>
                    </span>
                    <span className={cn(
                      "grid h-6 w-6 place-items-center rounded-full border-2",
                      roleIdx === i ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    )}>{roleIdx === i && <Check className="h-3.5 w-3.5" />}</span>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(1)} size="lg" className="mt-6 w-full gradient-primary text-primary-foreground">Continue</Button>
              <p className="mt-6 text-sm text-center text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleCreate} className="animate-fade-in">
              <button type="button" onClick={() => setStep(0)} className="text-xs text-muted-foreground hover:text-foreground">← Change role</button>
              <h1 className="mt-2 font-display text-3xl font-bold">Create your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">Signing up as <span className="font-semibold text-foreground">{roles[roleIdx].label}</span></p>
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-semibold">First name</label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" /></div>
                  <div><label className="text-sm font-semibold">Last name</label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1" /></div>
                </div>
                <div><label className="text-sm font-semibold">Email</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" /></div>
                <div><label className="text-sm font-semibold">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254..." required className="mt-1" /></div>
                <div>
                  <label className="text-sm font-semibold">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
                  {password.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn("h-full rounded-full strength-bar", strength.color)}
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-16 text-right">{strength.label}</span>
                      </div>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {passwordChecks.map((c) => {
                          const passed = c.test(password);
                          return (
                            <li key={c.label} className="flex items-center gap-1.5 text-xs">
                              <span className={cn(
                                "grid h-3.5 w-3.5 place-items-center rounded-full transition-colors",
                                passed ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
                              )}>
                                {passed ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                              </span>
                              <span className={cn(passed ? "text-foreground" : "text-muted-foreground")}>{c.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                <Button type="submit" size="lg" disabled={loading || strength.score < 60} className="w-full gradient-primary text-primary-foreground">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : <><ShieldCheck className="mr-2 h-4 w-4" /> Create account</>}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="hidden lg:block relative order-1 lg:order-2">
        <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 gradient-primary opacity-70" />
        <div className="absolute inset-0 flex items-end p-12 text-primary-foreground">
          <div>
            <h2 className="font-display text-3xl font-bold text-balance">Join thousands finding their next home.</h2>
            <p className="mt-3 text-primary-foreground/85">Verified listings. Direct owner contact. Zero hassle.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
