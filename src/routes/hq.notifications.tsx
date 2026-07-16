import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Send, Loader as Loader2, Users, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/notifications")({
  head: () => ({ meta: [{ title: "Notification Center — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQNotifications,
});

const TARGET_OPTIONS = [
  { key: "all", label: "Everyone", icon: Users, desc: "All registered users" },
  { key: "landlord", label: "Landlords", icon: MessageSquare, desc: "Property owners only" },
  { key: "agent", label: "Agents", icon: MessageSquare, desc: "Verified agents only" },
  { key: "buyer", label: "Buyers", icon: MessageSquare, desc: "All buyers" },
  { key: "tenant", label: "Tenants", icon: MessageSquare, desc: "All tenants" },
  { key: "seller", label: "Sellers", icon: MessageSquare, desc: "All sellers" },
];

const KIND_OPTIONS = [
  { key: "announcement", label: "Announcement" },
  { key: "alert", label: "Alert" },
  { key: "message", label: "Message" },
  { key: "promotion", label: "Promotion" },
];

interface NotificationRow {
  id: string;
  role: string | null;
  title: string;
  body: string | null;
  kind: string;
  read: boolean;
  created_at: string;
}

function HQNotifications() {
  const [target, setTarget] = useState("all");
  const [kind, setKind] = useState("announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [recent, setRecent] = useState<NotificationRow[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, role, title, body, kind, read, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecent(data ?? []);
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const send = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setSending(true);
    try {
      // For role-targeted notifications, insert with role set and user_id null
      // The RLS policy allows admin to insert notifications
      const { error } = await supabase.from("notifications").insert({
        role: target === "all" ? null : (target as any),
        user_id: null,
        title: title.trim(),
        body: body.trim() || null,
        kind,
        read: false,
      });

      if (error) throw error;

      toast.success(`Notification sent to ${target === "all" ? "everyone" : target + "s"}`);
      setTitle("");
      setBody("");
      fetchRecent();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <HQPage title="Notification Center" description="Send announcements, alerts, and promotions to users by role.">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Composer */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" /> Compose Notification
          </h2>

          {/* Target audience */}
          <div className="mb-5">
            <label className="text-sm font-semibold">Send to</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TARGET_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTarget(opt.key)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all",
                    target === opt.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg",
                    target === opt.key ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  )}>
                    <opt.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Kind */}
          <div className="mb-5">
            <label className="text-sm font-semibold">Type</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {KIND_OPTIONS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setKind(k.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    kind === k.key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-sm font-semibold">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New feature: Video tours are here!"
              className="mt-1.5"
              maxLength={120}
            />
          </div>

          {/* Body */}
          <div className="mb-5">
            <label className="text-sm font-semibold">Message</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write your message..."
              className="mt-1.5"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-muted-foreground">{body.length}/500 characters</p>
          </div>

          <Button
            onClick={send}
            disabled={sending || !title.trim()}
            className="gradient-primary text-primary-foreground w-full"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Notification
          </Button>
        </div>

        {/* Recent notifications */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Notifications</h2>
          {loadingRecent ? (
            <div className="grid min-h-[20vh] place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications sent yet.</p>
          ) : (
            <ul className="space-y-3 max-h-[500px] overflow-y-auto">
              {recent.map((n) => (
                <li key={n.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-primary">
                      {n.role ?? "all"}
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold capitalize">
                      {n.kind}
                    </span>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </HQPage>
  );
}
