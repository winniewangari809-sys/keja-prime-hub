import { createFileRoute } from "@tanstack/react-router";
import { useAuth, dashboardForRole } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      {
        title: "Notifications — KejaHub",
      },
      {
        name: "description",
        content: "View all your KejaHub notifications and alerts.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const notifications = [
    {
      id: "1",
      title: "New property match",
      description: "A 3-bedroom apartment in Westlands matches your saved search",
      time: "2 hours ago",
      read: false,
      type: "match",
    },
    {
      id: "2",
      title: "Price drop alert",
      description: "The apartment you viewed dropped by 5,000 KES",
      time: "5 hours ago",
      read: false,
      type: "price",
    },
    {
      id: "3",
      title: "Viewing confirmed",
      description: "Your viewing for Villa Karen has been confirmed for tomorrow at 2 PM",
      time: "1 day ago",
      read: true,
      type: "viewing",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Stay updated with the latest alerts and messages
          </p>

          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-900 rounded-lg border p-6 transition-colors ${
                    notification.read
                      ? "border-gray-200 dark:border-gray-800"
                      : "border-primary/30 bg-primary/5 dark:bg-primary/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You'll see updates here when you have new messages or property alerts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
