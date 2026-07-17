import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/lib/mock-data";

interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  properties?: Property;
}

export function SavedProperties() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchSavedProperties = async () => {
      const { data } = await supabase
        .from("property_saves")
        .select("*, properties(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setSavedProperties(data as SavedProperty[]);
      }
      setLoading(false);
    };

    fetchSavedProperties();

    const subscription = supabase
      .channel("property_saves")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "property_saves",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSavedProperties();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleRemove = async (saveId: string) => {
    try {
      await supabase
        .from("property_saves")
        .delete()
        .eq("id", saveId);

      toast.success("Removed from saved");
      setSavedProperties(savedProperties.filter(s => s.id !== saveId));
    } catch (error) {
      toast.error("Failed to remove property");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (savedProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No saved properties yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Start exploring and save your favorite properties
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-destructive" />
        Your Saved Properties ({savedProperties.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedProperties.map(save => {
          // Mock property data since we need to use mock data
          const mockProperty = {
            id: save.property_id,
            slug: `property-${save.property_id}`,
            title: save.properties?.title || "Property",
            location: save.properties?.location || "Location",
            price: save.properties?.price || 0,
            category: (save.properties?.category as any) || "rental",
            propertyType: save.properties?.propertyType || "Property",
            bedrooms: save.properties?.bedrooms || 0,
            bathrooms: save.properties?.bathrooms || 0,
            size: save.properties?.size || 0,
            amenities: save.properties?.amenities || [],
            images: save.properties?.images || [],
            description: save.properties?.description || "",
            featured: save.properties?.featured || false,
            status: (save.properties?.status as any) || "available",
            owner: save.properties?.owner || { name: "", phone: "", verificationTier: "unverified" },
          };

          return (
            <div key={save.id} className="relative group">
              <PropertyCard property={mockProperty} />
              <button
                onClick={() => handleRemove(save.id)}
                className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
