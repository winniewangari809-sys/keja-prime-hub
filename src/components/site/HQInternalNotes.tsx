import { useState, useEffect } from "react";
import { StickyNote, Plus, Trash2, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const noteLabels: Record<string, { label: string; color: string }> = {
  hot_lead: { label: "Hot Lead", color: "bg-red-500/15 text-red-500" },
  serious_buyer: { label: "Serious Buyer", color: "bg-emerald-500/15 text-emerald-600" },
  negotiation: { label: "Negotiation Started", color: "bg-blue-500/15 text-blue-500" },
  waiting: { label: "Waiting Response", color: "bg-amber-500/15 text-amber-600" },
  closed: { label: "Closed Deal", color: "bg-primary/15 text-primary" },
  general: { label: "General", color: "bg-secondary text-muted-foreground" },
};

interface Note {
  id: string;
  viewing_id: string | null;
  note: string;
  tag: string;
  created_at: string;
}

export function HQInternalNotes({ viewingId }: { viewingId?: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [tag, setTag] = useState("general");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [viewingId]);

  async function fetchNotes() {
    let query = supabase.from("admin_settings").select("id, value").ilike("key", "internal_note_%");
    if (viewingId) {
      query = query.eq("category", viewingId);
    }
    const { data } = await query.order("created_at", { ascending: false }).limit(20);
    if (data) {
      const parsed: Note[] = (data as any[]).map((d) => {
        try {
          const obj = JSON.parse(d.value);
          return { id: d.id, viewing_id: obj.viewing_id ?? null, note: obj.note ?? "", tag: obj.tag ?? "general", created_at: obj.created_at ?? new Date().toISOString() };
        } catch {
          return { id: d.id, viewing_id: null, note: String(d.value), tag: "general", created_at: new Date().toISOString() };
        }
      });
      setNotes(parsed);
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    const noteData = {
      note: newNote.trim(),
      tag,
      viewing_id: viewingId ?? null,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("admin_settings").insert({
      key: `internal_note_${Date.now()}`,
      value: JSON.stringify(noteData),
      category: viewingId ?? "general",
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to save note");
      return;
    }
    toast.success("Note saved");
    setNewNote("");
    setTag("general");
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("admin_settings").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete note");
      return;
    }
    setNotes(notes.filter((n) => n.id !== id));
    toast.success("Note deleted");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
        <StickyNote className="h-5 w-5 text-primary" /> Internal Notes
      </h3>
      <p className="text-xs text-muted-foreground mb-4">HQ-only notes. Not visible to buyers or property partners.</p>

      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(noteLabels).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setTag(key)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                tag === key ? meta.color + " ring-2 ring-offset-1 ring-primary/30" : "bg-secondary text-muted-foreground hover:bg-accent",
              )}
            >
              {meta.label}
            </button>
          ))}
        </div>
        <Textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
        />
        <Button size="sm" onClick={addNote} disabled={loading || !newNote.trim()}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5" /> Add Note</>}
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
        ) : (
          notes.map((n) => {
            const meta = noteLabels[n.tag] ?? noteLabels.general;
            return (
              <div key={n.id} className="flex items-start gap-2 rounded-lg border border-border p-3">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0", meta.color)}>
                  {meta.label}
                </span>
                <p className="flex-1 text-sm">{n.note}</p>
                <button onClick={() => deleteNote(n.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
