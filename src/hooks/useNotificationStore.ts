import { create } from 'zustand';
import { database, Notification } from '@/services/database';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  refresh: (userId: string, role: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string, role: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  refresh: (userId, role) => {
    const notifs = database.getNotifications(userId, role);
    set({ 
      notifications: notifs,
      unreadCount: notifs.filter(n => !n.isRead).length
    });
  },
  markAsRead: (id) => {
    database.markNotificationAsRead(id);
    // Note: Caller should refresh or we can try to get userId/role here if we had them
  },
  markAllAsRead: (userId, role) => {
    const all = database.getNotifications(userId, role);
    all.forEach(n => database.markNotificationAsRead(n.id));
    const refreshed = database.getNotifications(userId, role);
    set({ 
      notifications: refreshed,
      unreadCount: 0
    });
  }
}));
