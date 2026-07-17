import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, Save } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button, Input, Switch } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/pricing")({
  head: () => ({
    meta: [
      {
        title: "Pricing & Packages — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Pricing,
});

interface PricingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

function Pricing() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: "", category: "concierge", price: 0 });

  useEffect(() => {
    if (!authLoading) {
      fetchPricing();
    }
  }, [authLoading]);

  const fetchPricing = async () => {
    try {
      const { data } = await supabase
        .from("pricing_config")
        .select("id, name, category, price, active");

      if (data) {
        setItems(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            active: p.active !== false,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
      toast.error("Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const { error } = await supabase
        .from("pricing_config")
        .insert({
          name: newItem.name,
          category: newItem.category,
          price: newItem.price,
          active: true,
        });

      if (error) throw error;

      toast.success("Pricing item added");
      setNewItem({ name: "", category: "concierge", price: 0 });
      fetchPricing();
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item");
    }
  };

  const updateItem = async (id: string, updates: Partial<PricingItem>) => {
    try {
      const { error } = await supabase
        .from("pricing_config")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setItems(
        items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
      toast.success("Item updated");
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pricing_config")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems(items.filter((item) => item.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  const categories = [
    "concierge",
    "seller_package",
    "airbnb_package",
    "commercial_package",
    "promotion",
  ];

  if (authLoading || loading) {
    return (
      <HQPage title="Pricing & Packages" description="Manage pricing configuration">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pricing...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Pricing & Packages" description="Manage pricing configuration">
      <div className="space-y-6">
        {/* Add New Item */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Pricing Item
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Item name..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Price..."
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: parseFloat(e.target.value) })
              }
            />
            <Button onClick={handleAddItem}>Add Item</Button>
          </div>
        </div>

        {/* Pricing by Category */}
        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);

          return (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {category.replace(/_/g, " ").toUpperCase()}
              </h3>
              <div className="space-y-3">
                {categoryItems.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No items in this category</p>
                ) : (
                  categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(item.id, {
                                price: parseFloat(e.target.value),
                              })
                            }
                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Active
                          </label>
                          <Switch
                            checked={item.active}
                            onCheckedChange={(active) =>
                              updateItem(item.id, { active })
                            }
                          />
                        </div>

                        <Button
                          onClick={() => deleteItem(item.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </HQPage>
  );
}
