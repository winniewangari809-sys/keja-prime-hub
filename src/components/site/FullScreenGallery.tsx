import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullScreenGalleryProps {
  images: string[];
  initialIndex?: number;
  onClose?: () => void;
}

export function FullScreenGallery({
  images,
  initialIndex = 0,
  onClose,
}: FullScreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <img
          src={currentImage}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            cursor: zoom > 1 ? "grab" : "auto",
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur px-4 py-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Previous image (Arrow Left)"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="text-white text-sm font-semibold">
            {currentIndex + 1} / {images.length}
          </div>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Next image (Arrow Right)"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Center - Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className={cn(
              "p-2 rounded-full transition-colors",
              zoom > 1
                ? "hover:bg-white/20 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            )}
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>

          <span className="text-white text-sm font-semibold min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className={cn(
              "p-2 rounded-full transition-colors",
              zoom < 3
                ? "hover:bg-white/20 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            )}
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Right Section - Thumbnail Navigation */}
        <div className="flex gap-2 overflow-x-auto max-w-xs">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoom(1);
              }}
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all",
                idx === currentIndex
                  ? "border-white"
                  : "border-white/30 hover:border-white/50 opacity-70"
              )}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-black/60 backdrop-blur px-4 py-2 text-white text-xs text-center">
        Use Arrow Keys to navigate • Scroll to zoom • ESC to close
      </div>
    </div>
  );
}
