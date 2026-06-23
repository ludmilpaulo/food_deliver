import v1Client from '@/shared/lib/api/v1Client';

export type UnifiedNotification = {
  id: string;
  source: 'platform' | 'healthcare' | 'unified';
  module: string;
  notification_type: string;
  title: string;
  message: string;
  action_url: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifications(params?: {
  module?: string;
  limit?: number;
}): Promise<UnifiedNotification[]> {
  const { data } = await v1Client.get<UnifiedNotification[]>('/notifications/', {
    params,
  });
  return data;
}

export async function fetchUnreadCount(module?: string): Promise<number> {
  const { data } = await v1Client.get<{ unread_count: number }>(
    '/notifications/unread-count/',
    { params: module ? { module } : undefined },
  );
  return data.unread_count;
}

export async function markNotificationRead(compositeId: string): Promise<void> {
  await v1Client.patch(`/notifications/${encodeURIComponent(compositeId)}/read/`);
}

export async function markAllNotificationsRead(module?: string): Promise<number> {
  const { data } = await v1Client.patch<{ updated: number }>(
    '/notifications/mark-all-read/',
    module ? { module } : {},
  );
  return data.updated;
}
