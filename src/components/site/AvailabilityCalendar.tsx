import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Simple mock availability grid for Airbnb listings. */
export function AvailabilityCalendar({ seed = 0 }: { seed?: number }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const monthName = month.toLocaleString("en-KE", { month: "long", year: "numeric" });
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDay = month.getDay();

  const booked = useMemo(() => new Set(
    Array.from({ length: 8 }, (_, i) => ((seed + i * 3) % daysInMonth) + 1)
  ), [seed, daysInMonth]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">Availability · {monthName}</h3>
        <div className="flex gap-1">
          <button onClick={() => setOffset(o => o - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Prev month"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setOffset(o => o + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const isBooked = booked.has(d);
          return (
            <div key={d} className={cn(
              "aspect-square rounded-md grid place-items-center text-xs",
              isBooked ? "bg-destructive/10 text-destructive line-through" : "bg-success/10 text-success"
            )}>{d}</div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-[11px]">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Available</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Booked</span>
      </div>
    </div>
  );
}
