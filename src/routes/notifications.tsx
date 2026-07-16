import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { FriendlyEmpty } from "@/components/site/FriendlyEmpty";
import { cn } from "@/lib/utils";
import { MessageCircle, ShieldCheck, Calendar, Wallet, Bell, Megaphone, Home, Eye, FileText, Loader as Loader2, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

const iconMap: Record<string, typeof Bell> = {
  message: MessageCircle,
  verification: ShieldCheck,
  viewing: Calendar,
  payment: Wallet,
  alert: Bell,
  announcement: Megaphone,
  property: Home,
  offer: FileText,
  inquiry: MessageCircle,
};

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — KejaHub" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const auth = useAuth();
  const { notifications, unreadCount, loading, markAllAsRead, markAsRead } = useNotifications(auth.role, auth.user?.id ?? null);

  if (auth.loading || loading) {
    return (
      <>
        <PageHeader eyebrow="Notifications" title="Everything that matters to you" />
        <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Notifications" title="Everything that matters to you" description="Alerts are private — you only see the ones meant for your role." />
      <section className="container-app py-10">
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={async () => { await markAllAsRead(); toast.success("All notifications marked as read"); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-accent transition-colors"
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <FriendlyEmpty emoji="🌤" title="All quiet for now" description="You'll see alerts here as things happen." />
        ) : (
          <ul className="space-y-3 max-w-3xl">
            {notifications.map((n) => {
              const Icon = iconMap[n.kind] ?? Bell;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => { if (!n.read) markAsRead(n.id); }}
                    className={cn(
                      "w-full text-left rounded-2xl border border-border bg-card p-4 flex items-start gap-4 hover-lift transition-all",
                      n.unread && "bg-primary/5 border-primary/30"
                    )}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shrink-0"><Icon className="h-5 w-5" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{n.title}</p>
                      {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
