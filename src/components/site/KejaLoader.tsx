import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

const FRAMES = ["🔍", "🏠", "🏢", "🏬", "🌾"];

export function KejaLoader({ onDone, once = true }: { onDone?: () => void; once?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (once && sessionStorage.getItem("kejahub-splash-seen")) return;
    setVisible(true);
  }, [once]);

  useEffect(() => {
    if (!visible) return;
    if (frame < FRAMES.length) {
      const t = setTimeout(() => setFrame((f) => f + 1), 320);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (once) sessionStorage.setItem("kejahub-splash-seen", "1");
      setVisible(false);
      onDone?.();
    }, 550);
    return () => clearTimeout(t);
  }, [frame, visible, onDone, once]);

  if (!visible) return null;
  const done = frame >= FRAMES.length;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 backdrop-blur-md animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-24 w-24 grid place-items-center rounded-3xl gradient-primary shadow-elegant">
          {done ? (
            <div className="flex items-center gap-1.5 text-primary-foreground animate-scale-in">
              <Building2 className="h-8 w-8" />
            </div>
          ) : (
            <span key={frame} className="text-5xl animate-scale-in">{FRAMES[frame]}</span>
          )}
        </div>
        <p className="font-display text-2xl font-bold tracking-tight">
          Keja<span className="text-primary">Hub</span>
        </p>
        <div className="flex gap-1.5">
          {FRAMES.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= frame ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
