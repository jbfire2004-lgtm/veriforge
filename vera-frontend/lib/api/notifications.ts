import { apiGet, apiPatch, apiPost } from "@/lib/api";

const BASE = "/api/v1/notifications";

export type NotificationRow = {
  id: number;
  userId: number | null;
  channel: string;
  type: string;
  title: string | null;
  body: string | null;
  payload: Record<string, unknown>;
  status: string;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  inspectionDue: boolean;
  competencyExpiry: boolean;
  ppeExpiry: boolean;
  maintenanceDue: boolean;
  calibrationDue: boolean;
  assignmentAlerts: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  phone: string | null;
};

export async function listNotifications(unreadOnly?: boolean) {
  const q = unreadOnly ? "?unreadOnly=true" : "";
  return apiGet<NotificationRow[]>(`${BASE}${q}`);
}

export async function getUnreadNotificationCount() {
  return apiGet<{ count: number }>(`${BASE}/unread-count`);
}

export async function markNotificationRead(id: number) {
  return apiPatch(`${BASE}/${id}/read`, {});
}

export async function markAllNotificationsRead() {
  return apiPost(`${BASE}/read-all`, {});
}

export async function getNotificationSettings() {
  return apiGet<NotificationPreferences>(`${BASE}/settings`);
}

export async function updateNotificationSettings(
  body: Partial<NotificationPreferences>,
) {
  return apiPatch<NotificationPreferences>(`${BASE}/settings`, body);
}

export async function runNotificationScheduler(companyId?: number) {
  const q = companyId ? `?companyId=${companyId}` : "";
  return apiPost(`${BASE}/scheduler/run${q}`, {});
}

export async function sendTestNotification(title?: string, body?: string) {
  return apiPost(`${BASE}/test`, { title, body });
}
