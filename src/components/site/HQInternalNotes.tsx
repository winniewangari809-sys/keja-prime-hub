import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Plus, X } from "lucide-react";

interface InternalNote {
  id: string;
  content: string;
  tags: string[];
  created_at: string;
}

const TAG_OPTIONS = [
  "Hot Lead",
  "Serious Buyer",
  "Negotiation",
  "Waiting",
  "Closed",
];

const TAG_COLORS: Record<string, string> = {
  "Hot Lead": "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
  "Serious Buyer": "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
  "Negotiation": "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200",
  "Waiting": "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  "Closed": "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
};

export function HQInternalNotes() {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("admin_settings")
      .select("*")
      .eq("key", "internal_notes")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotes(data.map(item => ({
        id: item.id,
        content: item.value?.content || "",
        tags: item.value?.tags || [],
        created_at: item.created_at,
      })));
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .insert({
          key: "internal_notes",
          value: {
            content: newNote,
            tags: selectedTags,
          },
        });

      if (error) throw error;

      toast.success("Note added");
      setNewNote("");
      setSelectedTags([]);
      fetchNotes();
    } catch (error) {
      toast.error("Failed to add note");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await supabase
        .from("admin_settings")
        .delete()
        .eq("id", noteId);

      toast.success("Note deleted");
      fetchNotes();
    } catch (error) {
      toast.error("Failed to delete note");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Note Form */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Internal Note
        </h3>

        <div className="space-y-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this lead or transaction..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            rows={3}
          />

          <div>
            <label className="text-sm font-semibold mb-2 block">Tags (optional)</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTags(
                      selectedTags.includes(tag)
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                    selectedTags.includes(tag)
                      ? TAG_COLORS[tag]
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddNote}
            disabled={submitting || !newNote.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Note"}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h3 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Recent Notes
        </h3>

        {notes.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No internal notes yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-gray-900 dark:text-white flex-1">
                    {note.content}
                  </p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
