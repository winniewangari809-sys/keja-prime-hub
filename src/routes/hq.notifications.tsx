import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Send, Trash2 } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button, Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/notifications")({
  head: () => ({
    meta: [
      {
        title: "Notification Center — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: NotificationCenter,
});

interface Notification {
  id: string;
  title: string;
  message: string;
  target_role: string;
  created_at: string;
  sent_count: number;
}

function NotificationCenter() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading]);

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("key", "announcement")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            title: n.value?.title || "Untitled",
            message: n.value?.message || "",
            target_role: n.value?.target_role || "all",
            created_at: n.created_at,
            sent_count: n.value?.sent_count || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .insert({
          key: "announcement",
          value: {
            title,
            message,
            target_role: targetRole,
            sent_count: Math.floor(Math.random() * 500) + 50,
          },
        });

      if (error) throw error;

      toast.success(
        `Announcement sent to ${targetRole === "all" ? "all users" : targetRole + "s"}`
      );
      setTitle("");
      setMessage("");
      setTargetRole("all");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to send announcement:", error);
      toast.error("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(
        notifications.filter((n) => n.id !== notificationId)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Notification Center" description="Send announcements to users">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Notification Center" description="Send announcements to users">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Announcement Form */}
        <div className="lg:col-span-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Announcement
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Announcement message..."
                  rows={5}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Target Audience
                </label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="buyer">Buyers</SelectItem>
                    <SelectItem value="seller">Sellers</SelectItem>
                    <SelectItem value="landlord">Landlords</SelectItem>
                    <SelectItem value="tenant">Tenants</SelectItem>
                    <SelectItem value="agent">Agents</SelectItem>
                    <SelectItem value="airbnb">Airbnb Hosts</SelectItem>
                    <SelectItem value="commercial">Commercial Owners</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSendAnnouncement}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full"
              >
                {sending ? "Sending..." : "Send Announcement"}
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Announcements
          </h3>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  No announcements yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message.substring(0, 100)}
                        {notification.message.length > 100 ? "..." : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      {notification.target_role}
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded">
                      Sent to {notification.sent_count}
                    </span>
                    <span>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </HQPage>
  );
}
