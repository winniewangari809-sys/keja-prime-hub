import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dashboardForRole, type AppRole } from "@/hooks/use-auth";

type Search = { next?: string };

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — KejaHub" }, { name: "description", content: "Log in to KejaHub to save properties, message owners and manage listings." }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({ next: typeof s.next === "string" ? s.next : undefined }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      let role: AppRole | null = null;
      if (userId) {
        const { data: r, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (roleError) throw roleError;
        role = (r?.role as AppRole | undefined) ?? null;
      }
      if (!role) {
        toast.error("Your account has no role assigned. Please contact support.");
        return;
      }
      toast.success("👋 Welcome back to KejaHub");
      navigate({ to: (next && next.startsWith("/") ? next : dashboardForRole(role)) as any });
    } catch (err: any) {
      const msg = err?.message ?? "Sign in failed";
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
      <div className="flex items-center justify-center p-6 lg:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></span>
            <span className="font-display text-xl font-bold">Keja<span className="text-primary">Hub</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your property journey.</p>

          <div className="mt-8 space-y-4">
            <div><label className="text-sm font-semibold">Email</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" /></div>
            <div><label className="text-sm font-semibold">Password</label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" /></div>
            <Button type="submit" size="lg" disabled={loading} className="w-full gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
            </Button>
          </div>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            New to KejaHub? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
      <div className="hidden lg:block relative">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 gradient-primary opacity-70" />
        <div className="absolute inset-0 flex items-end p-12 text-primary-foreground">
          <div>
            <h2 className="font-display text-3xl font-bold text-balance">Kenya's most trusted property marketplace.</h2>
            <p className="mt-3 text-primary-foreground/85">Find. Rent. Buy. Lease.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
