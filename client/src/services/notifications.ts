import { apiFetch } from './api';

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const data = await apiFetch<{ notifications: NotificationItem[] }>('/notifications');
  return data.notifications ?? [];
}

export async function markNotificationRead(notificationId: string): Promise<NotificationItem> {
  const data = await apiFetch<{ notification: NotificationItem }>(`/notifications/${notificationId}/read`, {
    method: 'POST',
  });
  return data.notification;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'POST' });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiFetch(`/notifications/${notificationId}`, { method: 'DELETE' });
}

export async function createNotification(input: { title: string; message: string; type?: string; targetRole?: 'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'ADMIN'; userId?: string }): Promise<{ created: number }> {
  const data = await apiFetch<{ created: number }>('/notifications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data;
}
