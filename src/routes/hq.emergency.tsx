import { createFileRoute } from "@tanstack/react-router";
import { HQPage } from "@/components/site/HQPage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { TriangleAlert as AlertTriangle, Shield, Power, MessageSquareOff, Building2, UserPlus, Loader as Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/emergency")({
  head: () => ({ meta: [{ title: "Emergency Control — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQEmergency,
});

interface Setting {
  key: string;
  value: string;
}

const CONTROL_ITEMS = [
  {
    key: "maintenance_mode",
    label: "Maintenance Mode",
    desc: "Take the entire site offline. Users see a maintenance page.",
    icon: Power,
    danger: true,
  },
  {
    key: "messaging_enabled",
    label: "Messaging System",
    desc: "Disable all messaging between users.",
    icon: MessageSquareOff,
    danger: true,
  },
  {
    key: "listings_enabled",
    label: "New Listings",
    desc: "Stop users from creating new property listings.",
    icon: Building2,
    danger: true,
  },
  {
    key: "registrations_enabled",
    label: "New Registrations",
    desc: "Block new user sign-ups.",
    icon: UserPlus,
    danger: true,
  },
];

function HQEmergency() {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value");

      if (error) throw error;

      const map: Record<string, boolean> = {};
      for (const row of (data ?? []) as Setting[]) {
        // maintenance_mode: true = ON (danger). messaging_enabled: false = OFF (danger).
        // For "enabled" settings, value "true" means the feature is ON.
        // For maintenance_mode, value "true" means maintenance is ON.
        map[row.key] = row.value === "true";
      }
      setSettings(map);
    } catch {
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleSetting = async (key: string) => {
    setToggling(key);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentVal = settings[key] ?? false;
      const newVal = !currentVal;

      // Upsert the setting
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          key,
          value: String(newVal),
          updated_by: userData.user?.id ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" });

      if (error) throw error;

      setSettings({ ...settings, [key]: newVal });
      toast.success(`${CONTROL_ITEMS.find((c) => c.key === key)?.label} ${newVal ? "enabled" : "disabled"}`);
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setToggling(null);
      setConfirmTarget(null);
    }
  };

  const handleToggle = (key: string) => {
    // For danger items, show confirmation dialog
    const item = CONTROL_ITEMS.find((c) => c.key === key);
    if (item?.danger && !settings[key]) {
      setConfirmTarget(key);
    } else {
      toggleSetting(key);
    }
  };

  return (
    <HQPage title="Emergency Control" description="Kill switches and system-wide controls. Use with caution.">
      {loading ? (
        <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          {/* Warning banner */}
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">Danger Zone</p>
                <p className="text-xs text-muted-foreground mt-1">
                  These controls immediately affect all users. Disabling features will block the corresponding
                  actions across the entire platform. Changes take effect instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Control switches */}
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTROL_ITEMS.map((item) => {
              const isActive = settings[item.key] ?? false;
              // For maintenance_mode: active = ON (danger). For others: active = feature ON (safe), inactive = feature OFF (danger).
              const isDangerActive = item.key === "maintenance_mode" ? isActive : !isActive;
              return (
                <div
                  key={item.key}
                  className={cn(
                    "rounded-2xl border-2 p-5 transition-colors",
                    isDangerActive
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "grid h-11 w-11 place-items-center rounded-xl",
                        isDangerActive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      disabled={toggling === item.key}
                      className={cn(
                        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
                        item.key === "maintenance_mode"
                          ? (isActive ? "bg-destructive" : "bg-secondary")
                          : (isActive ? "bg-success" : "bg-destructive")
                      )}
                    >
                      {toggling === item.key ? (
                        <Loader2 className="absolute top-0.5 left-0.5 h-5 w-5 animate-spin text-white" />
                      ) : (
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            item.key === "maintenance_mode"
                              ? (isActive ? "translate-x-5" : "translate-x-0")
                              : (isActive ? "translate-x-5" : "translate-x-0")
                          )}
                        />
                      )}
                    </button>
                  </div>
                  <div className="mt-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      item.key === "maintenance_mode"
                        ? (isActive ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")
                        : (isActive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")
                    )}>
                      {item.key === "maintenance_mode"
                        ? (isActive ? "MAINTENANCE ON" : "OPERATIONAL")
                        : (isActive ? "ENABLED" : "DISABLED")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System settings preview */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Platform Settings
            </h2>
            <div className="space-y-2">
              {Object.entries(settings).length > 0 ? (
                Object.entries(settings).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <code className="text-xs text-muted-foreground">{key}</code>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      val ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
                    )}>
                      {String(val)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No settings configured.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirmation dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent>
          <DialogTitle>Enable {CONTROL_ITEMS.find((c) => c.key === confirmTarget)?.label}?</DialogTitle>
          <DialogDescription>
            This will immediately affect all users on the platform. Are you sure you want to proceed?
          </DialogDescription>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mt-4">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                {CONTROL_ITEMS.find((c) => c.key === confirmTarget)?.desc}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => confirmTarget && toggleSetting(confirmTarget)}
              disabled={toggling === confirmTarget}
            >
              {toggling === confirmTarget ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HQPage>
  );
}
