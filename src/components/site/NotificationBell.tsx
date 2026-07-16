import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";

const kindIcon: Record<string, string> = {
  message: "💬",
  verification: "✅",
  viewing: "📅",
  payment: "💰",
  alert: "🔔",
  announcement: "📢",
  property: "🏠",
  offer: "📄",
  inquiry: "💬",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const { notifications, unreadCount } = useNotifications(auth.role, auth.user?.id ?? null);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-md hover:bg-accent"
        aria-label="Alerts"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-card shadow-elegant animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-3">
              <p className="text-sm font-semibold">🔔 Alerts</p>
              <Link to="/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className={cn("border-b border-border/60 p-3 hover:bg-secondary/40", !n.read && "bg-primary/5")}>
                  <p className="text-sm font-semibold line-clamp-1">
                    {kindIcon[n.kind] && <span className="mr-1">{kindIcon[n.kind]}</span>}
                    {n.title}
                  </p>
                  {n.body && <p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p>}
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">All quiet for now.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
