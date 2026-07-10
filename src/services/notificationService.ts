import apiClient from './apiClient.js';

export type NotificationCategory =
  | 'TICKET'
  | 'PAYMENT'
  | 'MEMBERSHIP'
  | 'SPONSORSHIP'
  | 'FANTASY'
  | 'MATCH'
  | 'CLUB'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface AppNotification {
  id: number;
  event_type: string;
  event_label: string;
  category: NotificationCategory;
  category_label: string;
  priority: NotificationPriority;
  priority_label: string;
  title: string;
  message: string;
  action_url: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationInboxResponse {
  count: number;
  limit: number;
  offset: number;
  unread_count: number;
  results: AppNotification[];
}

export async function getNotificationInbox(params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  category?: NotificationCategory;
}): Promise<NotificationInboxResponse> {
  const response = await apiClient.get<NotificationInboxResponse>(
    '/accounts/notifications/inbox/',
    {
      params: {
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
        unread_only: params?.unreadOnly ? 'true' : undefined,
        category: params?.category,
      },
    },
  );

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get<{ unread_count: number }>(
    '/accounts/notifications/unread-count/',
  );

  return response.data.unread_count ?? 0;
}

export async function markNotificationRead(
  notificationId: number,
): Promise<AppNotification> {
  const response = await apiClient.post<{
    detail: string;
    notification: AppNotification;
  }>(`/accounts/notifications/${notificationId}/mark-read/`);

  return response.data.notification;
}

export async function markAllNotificationsRead(): Promise<{
  updated_count: number;
  unread_count: number;
}> {
  const response = await apiClient.post<{
    detail: string;
    updated_count: number;
    unread_count: number;
  }>('/accounts/notifications/mark-all-read/');

  return {
    updated_count: response.data.updated_count,
    unread_count: response.data.unread_count,
  };
}


export interface NotificationPreference {
  id: number;
  user: number;
  event_type: string;
  event_label: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferencesResponse {
  count: number;
  preferences: NotificationPreference[];
}

export interface NotificationPreferenceUpdatePayload {
  event_type: string;
  email_enabled?: boolean;
  push_enabled?: boolean;
  sms_enabled?: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  const response = await apiClient.get<NotificationPreferencesResponse>(
    '/accounts/notification-preferences/me/',
  );

  return response.data.preferences ?? [];
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferenceUpdatePayload[],
): Promise<NotificationPreference[]> {
  const response = await apiClient.patch<{
    updated: NotificationPreference[];
    errors?: unknown[];
  }>('/accounts/notification-preferences/me/', {
    preferences,
  });

  return response.data.updated ?? [];
}
