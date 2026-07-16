import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2, X, Play, Film } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { VideoPlayer } from "./VideoPlayer";

export interface GalleryMedia {
  url: string;
  category?: string;
  kind?: "photo" | "video";
  thumbnail?: string;
  duration?: string;
}

interface FullScreenGalleryProps {
  media: GalleryMedia[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
  title?: string;
}

export function FullScreenGallery({
  media,
  index,
  open,
  onOpenChange,
  onIndexChange,
  title,
}: FullScreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCurrentIndex(index);
  }, [index, open]);

  const goPrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + media.length) % media.length;
    setCurrentIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [currentIndex, media.length, onIndexChange]);

  const goNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % media.length;
    setCurrentIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [currentIndex, media.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goPrev, goNext, onOpenChange]);

  if (!open || media.length === 0) return null;

  const current = media[currentIndex];
  const isVideo = current.kind === "video";

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? "Removed from saved" : "Property saved!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Property on KejaHub",
          text: "Check out this property on KejaHub",
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-0 bg-black/95 p-0 shadow-none h-[100dvh] max-h-[100dvh] rounded-none">
        <DialogTitle className="sr-only">{title || "Gallery"} — Full Screen</DialogTitle>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Counter */}
        <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
          {currentIndex + 1} / {media.length}
          {current.category && (
            <span className="text-white/60">· {current.category}</span>
          )}
        </div>

        {/* Main media */}
        <div className="absolute inset-0 grid place-items-center">
          {isVideo ? (
            <div className="w-full max-w-4xl px-4">
              <VideoPlayer
                src={current.url}
                poster={current.thumbnail}
                className="aspect-video w-full"
                autoPlay
              />
            </div>
          ) : (
            <img
              src={current.url}
              alt={current.category || `Image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Previous button */}
        {media.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next button */}
        {media.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Bottom action bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSave}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <Heart className={saved ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"} />
              {saved ? "Saved" : "Save Property"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <Share2 className="h-5 w-5" /> Share
            </Button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div className="absolute bottom-20 left-0 right-0 z-[5] flex justify-center gap-1.5 px-4 overflow-x-auto pb-2">
            {media.map((m, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  onIndexChange?.(i);
                }}
                className={`relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  i === currentIndex ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={m.kind === "video" ? m.thumbnail : m.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {m.kind === "video" && (
                  <div className="absolute inset-0 grid place-items-center bg-black/40">
                    <Film className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
