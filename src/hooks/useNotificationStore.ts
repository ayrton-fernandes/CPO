import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'Sistema Ativo',
      description: 'Bem-vindo ao CPO Digital. O sistema de monitoramento está operando.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ],
  unreadCount: 1,
  addNotification: (notif) => set((state) => {
    const newNotifications = [
      {
        ...notif,
        id: Math.random().toString(36).substr(2, 9),
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ];
    return {
      notifications: newNotifications,
      unreadCount: newNotifications.filter(n => !n.isRead).length
    };
  }),
  markAsRead: (id) => set((state) => {
    const newNotifications = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return {
      notifications: newNotifications,
      unreadCount: newNotifications.filter(n => !n.isRead).length
    };
  }),
  markAllAsRead: () => set((state) => {
    const newNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
    return {
      notifications: newNotifications,
      unreadCount: 0
    };
  })
}));
