/**
 * VeriForge SaaS notification inbox client → `/api/notifications` → SaaS.
 */

import { getVeriHubSession } from "@/lib/verihub-org-api";

export type VeriForgeNotification = {
  id: string;
  orgId: string | null;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  meta?: unknown;
};

async function notifFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getVeriHubSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  const res = await fetch(`/api/notifications${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function listVeriForgeNotifications(opts?: {
  unreadOnly?: boolean;
  take?: number;
}) {
  const qs = new URLSearchParams();
  if (opts?.unreadOnly) qs.set("unreadOnly", "true");
  if (opts?.take) qs.set("take", String(opts.take));
  const q = qs.toString();
  return notifFetch<{
    items: VeriForgeNotification[];
    total: number;
    unread: number;
  }>(q ? `?${q}` : "");
}

export async function markVeriForgeNotificationsRead(ids: string[]) {
  return notifFetch<{ updated: number }>("/read", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function markAllVeriForgeNotificationsRead() {
  return notifFetch<{ updated: number }>("/read-all", {
    method: "POST",
    body: "{}",
  });
}

export async function sendVeriForgeEmail(input: {
  to: string;
  subject: string;
  body: string;
}) {
  return notifFetch<{ queued: boolean; id: string }>("/sendEmail", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
