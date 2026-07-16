import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./use-auth";

export interface Notification {
  id: string;
  user_id: string | null;
  role: AppRole | null;
  title: string;
  body: string | null;
  kind: string;
  read: boolean;
  created_at: string;
}

export function useNotifications(role: AppRole | null, userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},role.eq.${role}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      setNotifications([]);
      setUnreadCount(0);
    } else {
      setNotifications(data as Notification[]);
      setUnreadCount((data as Notification[]).filter(n => !n.read).length);
    }
    setLoading(false);
  }, [userId, role]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [userId]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetch };
}
