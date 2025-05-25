import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createNotification, 
  markNotificationAsRead, 
  getUserNotifications,
  type Notification,
  type NotificationType
} from '@/lib/notifications';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  };

  const notify = async (
    type: NotificationType,
    title: string,
    message: string,
    smsNumber?: string
  ) => {
    if (!user) return;

    try {
      const notification = await createNotification(
        user.id,
        type,
        title,
        message,
        smsNumber
      );
      setNotifications(prev => [notification, ...prev]);
      return notification;
    } catch (err) {
      console.error('Failed to create notification:', err);
      throw err;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  };

  return {
    notifications,
    loading,
    error,
    notify,
    markAsRead,
    refresh: loadNotifications
  };
}