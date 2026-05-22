import { create } from "zustand";
import api from "../api/axios";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      const { data } = await api.get("/notifications");
      set({
        notifications: data.data.notifications,
        unreadCount: data.data.unreadCount,
      });
    } catch {
      // silent
    }
  },

  checkDeadlines: async () => {
    try {
      await api.post("/notifications/check-deadlines");
      await get().fetchNotifications();
    } catch {
      // silent
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },
}));

export default useNotificationStore;
