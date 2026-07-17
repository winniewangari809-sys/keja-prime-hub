import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { dashboardForRole, type AppRole, useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      {
        title: "Sign Up — KejaHub",
      },
      {
        name: "description",
        content:
          "Create your KejaHub account and start finding or listing properties today.",
      },
    ],
  }),
  validateSearch: (search: Record<string, any>) => ({
    role: search.role as AppRole | undefined,
    intent: search.intent as "find" | "list" | undefined,
  }),
  component: SignupPage,
});

const ROLES: Array<{ id: AppRole; label: string; description: string }> = [
  {
    id: "buyer",
    label: "Buyer",
    description: "Looking to purchase a property",
  },
  {
    id: "tenant",
    label: "Tenant",
    description: "Looking to rent a property",
  },
  {
    id: "seller",
    label: "Seller",
    description: "Selling your property",
  },
  {
    id: "landlord",
    label: "Landlord",
    description: "Renting out your property",
  },
  {
    id: "agent",
    label: "Real Estate Agent",
    description: "Professional property broker",
  },
  {
    id: "airbnb",
    label: "Airbnb Host",
    description: "Short-term rental host",
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Commercial property owner",
  },
];

function SignupPage() {
  const search = useSearch({ from: "/signup" });
  const navigate = useNavigate();
  const { role: userRole } = useAuth();

  const [step, setStep] = useState<0 | 1 | 2>(search.role ? 1 : 0);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(
    (search.role as AppRole) || null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole) {
      navigate({ to: dashboardForRole(userRole) });
    }
  }, [userRole, navigate]);

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setStep(1);
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!selectedRole) {
        setError("Please select a role");
        setIsLoading(false);
        return;
      }

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error("Signup failed: " + signUpError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Signup failed: No user returned");
        setIsLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Insert user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: selectedRole,
      });

      if (roleError) {
        setError("Failed to set user role: " + roleError.message);
        toast.error("Failed to set user role");
        setIsLoading(false);
        return;
      }

      // Insert user profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: name,
        first_name: name.split(" ")[0],
        phone_number: phone,
      });

      if (profileError) {
        setError("Failed to create profile: " + profileError.message);
        toast.error("Failed to create profile");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Redirecting...");

      // Wait a moment then navigate
      setTimeout(() => {
        navigate({ to: dashboardForRole(selectedRole) });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          {step === 0 && (
            <>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                Get Started
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                What's your role on KejaHub?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLES.map((roleOption) => (
                  <button
                    key={roleOption.id}
                    onClick={() => handleRoleSelect(roleOption.id)}
                    className="p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {roleOption.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {roleOption.description}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Step 1: Email & Password
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailPasswordSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-gray-900 dark:text-white">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-900 dark:text-white">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    At least 6 characters
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  Complete Your Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Step 2: Personal Information
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-gray-900 dark:text-white">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                    Phone Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
