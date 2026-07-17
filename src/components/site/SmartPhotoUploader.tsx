import { useState } from "react";
import { Camera, ImagePlus, Video, Upload, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  category: string;
  isCover: boolean;
}

const MEDIA_CATEGORIES = [
  "Front View",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Garden/Balcony",
  "Parking",
  "Other",
];

interface SmartPhotoUploaderProps {
  propertyId: string;
  onMediaAdded?: (media: MediaItem) => void;
}

export function SmartPhotoUploader({ propertyId, onMediaAdded }: SmartPhotoUploaderProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Front View");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File, isVideo: boolean) => {
    if (isVideo && !file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (!isVideo && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setPendingFile(file);
    setShowCategoryDialog(true);
  };

  const handleTakePhoto = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileSelect(file, false);
      };
      input.click();
    } catch (error) {
      toast.error("Camera not available");
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileSelect(file, false);
      };
      input.click();
    } catch (error) {
      toast.error("Failed to open gallery");
    }
  };

  const handleRecordVideo = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileSelect(file, true);
      };
      input.click();
    } catch (error) {
      toast.error("Video recording not available");
    }
  };

  const handleChooseVideo = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileSelect(file, true);
      };
      input.click();
    } catch (error) {
      toast.error("Failed to open gallery");
    }
  };

  const uploadFile = async () => {
    if (!pendingFile) return;

    setUploading(true);
    try {
      const fileExt = pendingFile.name.split(".").pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("property-media")
        .upload(fileName, pendingFile);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("property-media")
        .getPublicUrl(data.path);

      const isVideo = pendingFile.type.startsWith("video/");
      const newMedia: MediaItem = {
        id: `${propertyId}-${Date.now()}`,
        url: publicData.publicUrl,
        type: isVideo ? "video" : "photo",
        category: selectedCategory,
        isCover: media.length === 0,
      };

      setMedia([...media, newMedia]);
      onMediaAdded?.(newMedia);

      toast.success(`${isVideo ? "Video" : "Photo"} uploaded successfully`);
      setShowCategoryDialog(false);
      setPendingFile(null);
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
    toast.success("Media removed");
  };

  const handleSetCover = (id: string) => {
    setMedia(media.map(m => ({ ...m, isCover: m.id === id })));
  };

  return (
    <div className="space-y-6">
      {/* Upload Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleTakePhoto}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-primary hover:bg-primary/5 transition-colors"
        >
          <Camera className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold">Take Picture</span>
        </button>

        <button
          onClick={handleChooseFromGallery}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-primary hover:bg-primary/5 transition-colors"
        >
          <ImagePlus className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold">Choose Image</span>
        </button>

        <button
          onClick={handleRecordVideo}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-primary hover:bg-primary/5 transition-colors"
        >
          <Video className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold">Record Video</span>
        </button>

        <button
          onClick={handleChooseVideo}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-primary hover:bg-primary/5 transition-colors"
        >
          <Upload className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold">Choose Video</span>
        </button>
      </div>

      {/* Category Dialog */}
      {showCategoryDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h3 className="font-display font-bold text-xl mb-4">Select Category</h3>

            <div className="space-y-2 mb-6">
              {MEDIA_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "w-full px-4 py-2 text-left rounded-lg font-semibold transition-colors",
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadFile}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Gallery */}
      {media.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">
            Uploaded Media ({media.length})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map(item => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square"
              >
                {item.type === "photo" ? (
                  <img
                    src={item.url}
                    alt={item.category}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleSetCover(item.id)}
                    className="p-2 bg-white text-primary rounded-lg hover:bg-gray-200 transition-colors"
                    title="Set as cover"
                  >
                    <Star
                      className={cn(
                        "w-5 h-5",
                        item.isCover && "fill-current"
                      )}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white text-destructive rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <p className="text-xs text-white font-semibold">{item.category}</p>
                  {item.isCover && (
                    <p className="text-xs text-yellow-400 font-semibold">Cover Photo</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
