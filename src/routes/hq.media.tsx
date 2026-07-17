import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Image, CircleCheck as CheckCircle2, Circle as XCircle, Trash2, CircleAlert as AlertCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/media")({
  head: () => ({
    meta: [
      {
        title: "Media Control — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: MediaControl,
});

interface MediaItem {
  id: string;
  property_id: string;
  media_url: string;
  media_type: string;
  status: string;
  created_at: string;
}

function MediaControl() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      fetchMedia();
    }
  }, [authLoading]);

  const fetchMedia = async () => {
    try {
      const { data } = await supabase
        .from("property_media")
        .select("id, property_id, media_url, media_type, status, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setMedia(
          data.map((m: any) => ({
            id: m.id,
            property_id: m.property_id,
            media_url: m.media_url,
            media_type: m.media_type,
            status: m.status || "pending",
            created_at: m.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const updateMediaStatus = async (mediaId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("property_media")
        .update({ status })
        .eq("id", mediaId);

      if (error) throw error;

      setMedia(
        media.map((m) =>
          m.id === mediaId ? { ...m, status } : m
        )
      );
      toast.success("Media updated");
    } catch (error) {
      console.error("Failed to update media:", error);
      toast.error("Failed to update media");
    }
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from("property_media")
        .delete()
        .eq("id", mediaId);

      if (error) throw error;

      setMedia(media.filter((m) => m.id !== mediaId));
      toast.success("Media deleted");
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media");
    }
  };

  const filteredMedia = media.filter(
    (item) => filterStatus === "all" || item.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Media Control" description="Review and manage property media">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading media...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Media Control" description="Review and manage property media">
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                filterStatus === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Media</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {media.length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {media.filter((m) => m.status === "pending").length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {media.filter((m) => m.status === "approved").length}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {media.filter((m) => m.status === "rejected").length}
            </p>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-soft transition-shadow"
            >
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {item.media_type === "image" || item.media_url.includes(".jpg") || item.media_url.includes(".png") ? (
                  <img
                    src={item.media_url}
                    alt="Media"
                    className="w-full h-full object-cover"
                  />
                ) : item.media_type === "video" || item.media_url.includes(".mp4") ? (
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Property: {item.property_id}
                  </p>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold inline-block", getStatusColor(item.status))}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  {item.status === "pending" && (
                    <>
                      <Button
                        onClick={() => updateMediaStatus(item.id, "approved")}
                        size="sm"
                        className="flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateMediaStatus(item.id, "rejected")}
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => deleteMedia(item.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {filterStatus === "all" ? "No media found" : `No ${filterStatus} media`}
            </p>
          </div>
        )}
      </div>
    </HQPage>
  );
}
