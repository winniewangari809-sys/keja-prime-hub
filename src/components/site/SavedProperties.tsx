import { useEffect, useState } from "react";
import { Heart, Trash2, Loader as Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SavedProperty {
  id: string;
  property_id: string;
  title: string;
  location: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
}

export function SavedProperties({ userId }: { userId?: string }) {
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    async function fetchSaved() {
      const { data } = await supabase
        .from("property_saves")
        .select(`
          id,
          property_id,
          created_at,
          properties!inner(title, location, price, images)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) {
        const mapped: SavedProperty[] = (data as any[]).map((d) => ({
          id: d.id,
          property_id: d.property_id,
          title: d.properties?.title ?? "Property",
          location: d.properties?.location ?? null,
          price: d.properties?.price ?? null,
          image_url: d.properties?.images?.[0] ?? null,
          created_at: d.created_at,
        }));
        setSaved(mapped);
      }
      setLoading(false);
    }
    fetchSaved();
  }, [userId]);

  const removeSaved = async (id: string) => {
    const { error } = await supabase.from("property_saves").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove saved property");
      return;
    }
    setSaved(saved.filter((s) => s.id !== id));
    toast.success("Property removed from saved");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-primary" /> Saved Properties
        </h3>
        <div className="grid h-24 place-items-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-primary" /> Saved Properties
        </h3>
        <p className="text-sm text-muted-foreground">
          No saved properties yet. Browse listings and tap the heart icon to save properties for later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" /> Saved Properties
        </h3>
        <span className="text-xs text-muted-foreground">{saved.length} saved</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((s) => (
          <div key={s.id} className="group rounded-xl border border-border overflow-hidden hover-lift">
            <div className="relative h-32 overflow-hidden">
              {s.image_url ? (
                <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-secondary text-muted-foreground">
                  <Heart className="h-6 w-6" />
                </div>
              )}
              <button
                onClick={() => removeSaved(s.id)}
                className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm line-clamp-1">{s.title}</p>
              {s.location && <p className="text-xs text-muted-foreground mt-0.5">{s.location}</p>}
              {s.price != null && (
                <p className="text-sm font-bold text-primary mt-1">KSh {s.price.toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
