import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Hop as Home, Search, Heart, MessageCircle, Circle as HelpCircle, Info, Building2, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "./NotificationBell";
import { BrandLogo } from "./BrandLogo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useAuth, dashboardForRole } from "@/hooks/use-auth";
import { toast } from "sonner";

const links = [
  { to: "/",                   label: "Home",         icon: Home },
  { to: "/rentals",            label: "🔍 Rentals",   icon: Search },
  { to: "/airbnbs",            label: "🏨 Airbnbs",   icon: Building2 },
  { to: "/homes-for-sale",     label: "🏡 For Sale",  icon: Home },
  { to: "/commercial-property",label: "🏢 Commercial",icon: Building2 },
  { to: "/property-requests",  label: "❤️ Requests",  icon: Heart },
  { to: "/concierge",          label: "💬 House Help",icon: MessageCircle },
  { to: "/about",              label: "About",        icon: Info },
  { to: "/contact",            label: "Contact",      icon: HelpCircle },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const isAuthed = !!auth.user;
  const dashHref = dashboardForRole(auth.role);
  const isBuyerOrTenant = auth.role === "buyer" || auth.role === "tenant";
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/rentals", search: { q: searchQuery.trim() } });
    }
  }

  async function handleSignOut() {
    await auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="KejaHub home">
          <BrandLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              activeProps={{ className: "text-primary bg-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {isBuyerOrTenant && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="pl-9 h-9"
              />
            </div>
          </form>
        )}

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <ThemeSwitcher />
          <NotificationBell />
          {isAuthed ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={dashHref as any}><LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}><LogOut className="mr-1 h-4 w-4" /> Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">👤 Login</Link>
              </Button>
              <Button asChild size="sm" className="gradient-primary text-primary-foreground shadow-soft">
                <Link to="/post-listing">🏠 List My Property</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden grid h-10 w-10 place-items-center rounded-md hover:bg-accent"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container-app py-4 flex flex-col gap-1">
            {isBuyerOrTenant && (
              <form onSubmit={(e) => { handleSearch(e); setOpen(false); }} className="mb-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="pl-9 h-10"
                  />
                </div>
              </form>
            )}
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-accent"
                activeProps={{ className: "text-primary bg-accent" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-2">
              <ThemeSwitcher />
              <div className="flex gap-2">
                {isAuthed ? (
                  <>
                    <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                      <Link to={dashHref as any}>Dashboard</Link>
                    </Button>
                    <Button className="flex-1" variant="outline" onClick={() => { setOpen(false); handleSignOut(); }}>Sign out</Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="flex-1 gradient-primary text-primary-foreground" onClick={() => setOpen(false)}>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
