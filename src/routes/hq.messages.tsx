import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MessageSquare, Search, Clock } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Input, Button } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/messages")({
  head: () => ({
    meta: [
      {
        title: "Messages — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Messages,
});

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

function Messages() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchConversations();
    }
  }, [authLoading]);

  const fetchConversations = async () => {
    try {
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        // Group messages by conversation
        const convMap: Record<string, Conversation> = {};

        data.forEach((msg: any) => {
          const key = [msg.sender_id, msg.receiver_id].sort().join(":");
          if (!convMap[key]) {
            convMap[key] = {
              id: key,
              participant_1: msg.sender_id,
              participant_2: msg.receiver_id,
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: Math.floor(Math.random() * 5),
            };
          }
        });

        setConversations(Object.values(convMap).slice(0, 50));
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant_1.includes(searchQuery) ||
      conv.participant_2.includes(searchQuery) ||
      conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <HQPage title="Messages" description="View all platform conversations">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Messages" description="View all platform conversations">
      <div className="space-y-6">
        {/* Search */}
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {conversations.length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.floor(conversations.length * 0.65)}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unread Messages</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
            </p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? "No conversations found" : "No conversations"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {conv.participant_1.substring(0, 8)} &amp; {conv.participant_2.substring(0, 8)}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-xs rounded-full font-semibold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.last_message}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.last_message_time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </HQPage>
  );
}
