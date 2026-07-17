import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TriangleAlert as AlertTriangle, Power, Info } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/emergency")({
  head: () => ({
    meta: [
      {
        title: "Emergency Control — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: EmergencyControl,
});

interface KillSwitch {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  color: string;
  warning: string;
}

function EmergencyControl() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    signup_disabled: false,
    listings_disabled: false,
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [confirmingSwitch, setConfirmingSwitch] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [authLoading]);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("key, value");

      if (data) {
        const newSettings: Record<string, boolean> = {
          signup_disabled: false,
          listings_disabled: false,
          maintenance_mode: false,
        };

        data.forEach((item: any) => {
          if (item.key === "signup_disabled") {
            newSettings.signup_disabled = item.value?.enabled || false;
          }
          if (item.key === "listings_disabled") {
            newSettings.listings_disabled = item.value?.enabled || false;
          }
          if (item.key === "maintenance_mode") {
            newSettings.maintenance_mode = item.value?.enabled || false;
          }
        });

        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (key: string) => {
    try {
      const newValue = !settings[key];

      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key,
          value: { enabled: newValue },
        });

      if (error) throw error;

      setSettings({
        ...settings,
        [key]: newValue,
      });

      toast.success(
        `${key === "signup_disabled" ? "Signups" : key === "listings_disabled" ? "Listings" : "Maintenance mode"} ${
          newValue ? "disabled" : "enabled"
        }`
      );
      setConfirmingSwitch(null);
    } catch (error) {
      console.error("Failed to toggle switch:", error);
      toast.error("Failed to update setting");
    }
  };

  const switches: KillSwitch[] = [
    {
      id: "signup_disabled",
      name: "Disable Signups",
      description: "Prevent new user registrations",
      enabled: settings.signup_disabled,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "text-yellow-600 dark:text-yellow-400",
      warning:
        "When enabled, new users cannot create accounts. Existing users can still log in.",
    },
    {
      id: "listings_disabled",
      name: "Disable Listings",
      description: "Prevent new property listings",
      enabled: settings.listings_disabled,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "text-orange-600 dark:text-orange-400",
      warning:
        "When enabled, users cannot post new listings. Existing listings remain visible.",
    },
    {
      id: "maintenance_mode",
      name: "Maintenance Mode",
      description: "Show maintenance page to all users",
      enabled: settings.maintenance_mode,
      icon: <Power className="w-6 h-6" />,
      color: "text-red-600 dark:text-red-400",
      warning:
        "When enabled, all users see a maintenance page. Platform becomes inaccessible.",
    },
  ];

  if (authLoading || loading) {
    return (
      <HQPage title="Emergency Control" description="Critical platform control switches">
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
    <HQPage title="Emergency Control" description="Critical platform control switches">
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Caution: Emergency Controls
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              These controls directly impact platform availability and user experience. Use
              with caution and document all changes.
            </p>
          </div>
        </div>

        {/* Kill Switches */}
        <div className="grid gap-4">
          {switches.map((switchItem) => (
            <div
              key={switchItem.id}
              className={cn(
                "border rounded-lg p-6 transition-all",
                switchItem.enabled
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={switchItem.color}>
                      {switchItem.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {switchItem.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {switchItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {switchItem.warning}
                      </p>
                    </div>
                  </div>
                </div>

                <Dialog
                  open={confirmingSwitch === switchItem.id}
                  onOpenChange={(open) =>
                    setConfirmingSwitch(open ? switchItem.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      variant={switchItem.enabled ? "destructive" : "outline"}
                      size="lg"
                      className="flex-shrink-0"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {switchItem.enabled ? "Disable" : "Enable"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Action</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to{" "}
                        {switchItem.enabled ? "disable" : "enable"}{" "}
                        <span className="font-semibold">
                          {switchItem.name.toLowerCase()}
                        </span>
                        ?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {switchItem.warning}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          toggleSwitch(switchItem.id)
                        }
                        variant="destructive"
                        className="flex-1"
                      >
                        Confirm {switchItem.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        onClick={() => setConfirmingSwitch(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {switchItem.enabled && (
                <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                  <Power className="w-4 h-4" />
                  CURRENTLY ACTIVE
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active Switches Summary */}
        {Object.values(settings).some((v) => v) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
              Active Emergency Controls
            </h3>
            <ul className="space-y-2">
              {settings.signup_disabled && (
                <li className="text-sm text-yellow-800 dark:text-yellow-200">
                  - New user signups are disabled
                </li>
              )}
              {settings.listings_disabled && (
                <li className="text-sm text-yellow-800 dark:text-yellow-200">
                  - New property listings are disabled
                </li>
              )}
              {settings.maintenance_mode && (
                <li className="text-sm text-yellow-800 dark:text-yellow-200">
                  - Maintenance mode is active
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </HQPage>
  );
}
