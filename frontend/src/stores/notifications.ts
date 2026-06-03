import { create } from "zustand";
import api from "@/lib/api";
import type { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/notifications");
      set({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch("/notifications/read-all").catch(() => {});
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
