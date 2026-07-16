import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Image as ImageIcon, Trash2, Star, GripVertical, Plus, Loader as Loader2, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Film, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type PhotoCategory =
  | "Cover Photo"
  | "Living Room"
  | "Kitchen"
  | "Bedroom"
  | "Bathroom"
  | "Toilet"
  | "Dining Area"
  | "Compound"
  | "Parking"
  | "Entrance"
  | "Security Gate"
  | "Office Area"
  | "Shop Front"
  | "Airbnb Amenities"
  | "Exterior"
  | "Pool"
  | "Balcony"
  | "Reception"
  | "Open Space"
  | "Floor Plan";

export const ALL_PHOTO_CATEGORIES: PhotoCategory[] = [
  "Cover Photo", "Living Room", "Kitchen", "Bedroom", "Bathroom", "Toilet",
  "Dining Area", "Compound", "Parking", "Entrance", "Security Gate",
  "Office Area", "Shop Front", "Airbnb Amenities", "Exterior", "Pool",
  "Balcony", "Reception", "Open Space", "Floor Plan",
];

export const CATEGORY_ICONS: Record<PhotoCategory, string> = {
  "Cover Photo": "🏠",
  "Living Room": "🛋",
  Kitchen: "🍳",
  Bedroom: "🛏",
  Bathroom: "🚿",
  Toilet: "🚽",
  "Dining Area": "🍽",
  Compound: "🌳",
  Parking: "🚗",
  Entrance: "🚪",
  "Security Gate": "🛡",
  "Office Area": "🏢",
  "Shop Front": "🏬",
  "Airbnb Amenities": "🏨",
  Exterior: "🏡",
  Pool: "🏊",
  Balcony: "🌅",
  Reception: "🛎",
  "Open Space": "📐",
  "Floor Plan": "📋",
};

export interface UploadedPhoto {
  id?: string;
  url: string;
  category: PhotoCategory;
  file?: File;
  progress: number;
  uploading: boolean;
  error?: string;
  storage_path?: string;
  is_cover: boolean;
  display_order: number;
}

interface SmartPhotoUploaderProps {
  propertyId?: string;
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  requiredCategories?: PhotoCategory[];
}

export function SmartPhotoUploader({
  propertyId,
  photos,
  onPhotosChange,
  requiredCategories = [],
}: SmartPhotoUploaderProps) {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingFileIndex, setPendingFileIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const videoCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoGalleryInputRef = useRef<HTMLInputElement | null>(null);

  const takePhoto = () => {
    cameraInputRef.current?.click();
  };

  const chooseFromGallery = () => {
    galleryInputRef.current?.click();
  };

  const recordVideo = () => {
    videoCameraInputRef.current?.click();
  };

  const chooseVideo = () => {
    videoGalleryInputRef.current?.click();
  };

  const handleFilesSelected = (files: FileList | null, source: "camera" | "gallery") => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    setPendingFiles(validFiles);
    setPendingFileIndex(0);
    setShowCategoryDialog(true);
  };

  const handleVideoSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("video/")) {
        toast.error(`${f.name} is not a video`);
        return false;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    setPendingFiles(validFiles);
    setPendingFileIndex(0);
    setShowCategoryDialog(true);
  };

  const assignCategory = async (category: PhotoCategory) => {
    const file = pendingFiles[pendingFileIndex];
    if (!file) return;

    const isCover = category === "Cover Photo" || photos.length === 0;
    const photo: UploadedPhoto = {
      url: URL.createObjectURL(file),
      category,
      file,
      progress: 0,
      uploading: true,
      is_cover: isCover,
      display_order: photos.length,
    };
    onPhotosChange([...photos, photo]);

    // Start upload
    uploadFile(file, category, photos.length, isCover);

    // Move to next file or close dialog
    if (pendingFileIndex + 1 < pendingFiles.length) {
      setPendingFileIndex(pendingFileIndex + 1);
    } else {
      setShowCategoryDialog(false);
      setPendingFiles([]);
      setPendingFileIndex(0);
    }
  };

  const uploadFile = async (
    file: File,
    category: PhotoCategory,
    order: number,
    isCover: boolean,
  ) => {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const basePath = propertyId || "temp";
    const storagePath = `${basePath}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("property-media")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (event) => {
            const pct = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            onPhotosChange(
              photos.map((p, i) =>
                i === order ? { ...p, progress: pct } : p,
              ),
            );
          },
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("property-media")
        .getPublicUrl(storagePath);

      onPhotosChange(
        photos.map((p, i) =>
          i === order
            ? {
                ...p,
                url: urlData.publicUrl,
                storage_path: storagePath,
                uploading: false,
                progress: 100,
              }
            : p,
        ),
      );

      // If we have a propertyId, insert into property_media table
      if (propertyId) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from("property_media").insert({
            property_id: propertyId,
            owner_id: userData.user.id,
            kind: "photo",
            category,
            storage_path: storagePath,
            public_url: urlData.publicUrl,
            file_size: file.size,
            mime_type: file.type,
            display_order: order,
            is_cover: isCover,
            review_status: "pending",
          });
        }
      }

      toast.success(`${category} photo uploaded`);
    } catch (err: any) {
      onPhotosChange(
        photos.map((p, i) =>
          i === order ? { ...p, uploading: false, error: err.message || "Upload failed" } : p,
        ),
      );
      toast.error(`Upload failed: ${err.message || "Unknown error"}`);
    }
  };

  const removePhoto = (index: number) => {
    const photo = photos[index];
    if (photo.storage_path) {
      supabase.storage.from("property-media").remove([photo.storage_path]);
    }
    if (photo.id) {
      supabase.from("property_media").delete().eq("id", photo.id);
    }
    const newPhotos = photos.filter((_, i) => i !== index);
    // Reassign cover if we removed the cover
    if (photo.is_cover && newPhotos.length > 0) {
      newPhotos[0] = { ...newPhotos[0], is_cover: true, category: "Cover Photo" as PhotoCategory };
    }
    onPhotosChange(newPhotos);
    toast.success("Photo removed");
  };

  const setCover = (index: number) => {
    onPhotosChange(
      photos.map((p, i) => ({
        ...p,
        is_cover: i === index,
        category: i === index ? ("Cover Photo" as PhotoCategory) : p.category === "Cover Photo" ? ("Living Room" as PhotoCategory) : p.category,
      })),
    );
    toast.success("Cover photo updated");
  };

  const changeCategory = (index: number, category: PhotoCategory) => {
    onPhotosChange(
      photos.map((p, i) => (i === index ? { ...p, category } : p)),
    );
    if (photos[index].id) {
      supabase
        .from("property_media")
        .update({ category })
        .eq("id", photos[index].id!);
    }
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, moved);
    // Reassign display_order and cover
    const reordered = newPhotos.map((p, i) => ({
      ...p,
      display_order: i,
      is_cover: i === 0,
    }));
    onPhotosChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success("Photos reordered");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Required photos check
  const missingCategories = requiredCategories.filter(
    (cat) => !photos.some((p) => p.category === cat && !p.error),
  );

  const uploadCount = photos.filter((p) => p.uploading).length;
  const overallProgress =
    photos.length > 0
      ? Math.round(photos.reduce((sum, p) => sum + p.progress, 0) / photos.length)
      : 0;

  return (
    <div>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files, "camera")}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files, "gallery")}
      />
      <input
        ref={videoCameraInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleVideoSelected(e.target.files)}
      />
      <input
        ref={videoGalleryInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleVideoSelected(e.target.files)}
      />

      {/* Direct action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={takePhoto} className="gradient-primary text-primary-foreground">
          <Camera className="h-4 w-4" /> Take Picture
        </Button>
        <Button type="button" onClick={chooseFromGallery} variant="outline">
          <ImageIcon className="h-4 w-4" /> Choose From Gallery
        </Button>
        <Button type="button" onClick={recordVideo} variant="outline">
          <Video className="h-4 w-4" /> Record Video
        </Button>
        <Button type="button" onClick={chooseVideo} variant="outline">
          <Film className="h-4 w-4" /> Choose Video
        </Button>
      </div>

      {/* Upload progress */}
      {uploadCount > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Uploading {uploadCount} photo{uploadCount > 1 ? "s" : ""}... {overallProgress}%
          </div>
          <Progress value={overallProgress} className="mt-2" />
        </div>
      )}

      {/* Photo gallery grid with drag-and-drop */}
      {photos.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-3">
            Drag to rearrange. The first photo is your cover. Click the star to change cover.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-move",
                  photo.is_cover ? "border-primary ring-2 ring-primary/30" : "border-border",
                  draggedIndex === index && "opacity-50",
                  dragOverIndex === index && draggedIndex !== index && "border-primary border-dashed",
                )}
              >
                <img
                  src={photo.url}
                  alt={photo.category}
                  className={cn(
                    "h-full w-full object-cover",
                    photo.uploading && "opacity-50",
                  )}
                />

                {/* Cover badge */}
                {photo.is_cover && (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
                    <Star className="h-2.5 w-2.5 fill-current" /> COVER
                  </div>
                )}

                {/* Drag handle */}
                <div className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>

                {/* Upload progress overlay */}
                {photo.uploading && (
                  <div className="absolute inset-0 grid place-items-center bg-black/40">
                    <div className="w-full px-4">
                      <Progress value={photo.progress} className="h-1.5" />
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {photo.error && (
                  <div className="absolute inset-0 grid place-items-center bg-destructive/80 text-white">
                    <div className="text-center px-2">
                      <AlertCircle className="h-5 w-5 mx-auto" />
                      <p className="text-[10px] mt-1">Failed</p>
                    </div>
                  </div>
                )}

                {/* Category label + actions */}
                {!photo.uploading && !photo.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={photo.category}
                      onChange={(e) => changeCategory(index, e.target.value as PhotoCategory)}
                      className="w-full rounded-md bg-white/90 px-1.5 py-1 text-[10px] font-semibold text-gray-900 border-0 outline-none"
                    >
                      {ALL_PHOTO_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCover(index)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold transition-colors",
                          photo.is_cover
                            ? "bg-primary/20 text-primary"
                            : "bg-white/20 text-white hover:bg-white/30",
                        )}
                      >
                        <Star className={cn("h-2.5 w-2.5", photo.is_cover && "fill-current")} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="inline-flex items-center gap-1 rounded-md bg-destructive/80 px-1.5 py-1 text-[10px] font-semibold text-white hover:bg-destructive transition-colors"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add more tile */}
            <button
              type="button"
              onClick={takePhoto}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs font-medium">Add More</span>
            </button>
          </div>
        </div>
      )}

      {/* Required photos warning */}
      {missingCategories.length > 0 && photos.length > 0 && (
        <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-warning-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning-foreground">Required photos missing</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add these before submitting: {missingCategories.map((c) => CATEGORY_ICONS[c] + " " + c).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {photos.length > 0 && missingCategories.length === 0 && requiredCategories.length > 0 && (
        <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-sm font-semibold text-success">All required photos uploaded!</p>
          </div>
        </div>
      )}

      {/* Category selection dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogTitle>What does this photo show?</DialogTitle>
          {pendingFiles[pendingFileIndex] && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{pendingFiles[pendingFileIndex].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(pendingFiles[pendingFileIndex].size / 1024 / 1024).toFixed(1)} MB
                    {pendingFiles.length > 1 && ` · ${pendingFileIndex + 1} of ${pendingFiles.length}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {ALL_PHOTO_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => assignCategory(cat)}
                    className="flex items-center gap-2 rounded-lg border-2 border-border p-3 text-left text-sm hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                    <span className="font-medium">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
