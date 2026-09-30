"use client";

import { NotificationItem } from "./NotificationItem";
import type { VeriForgeNotification } from "@/lib/veriforge-notifications-api";

export function NotificationList({
  items,
  loading,
  emptyLabel = "No notifications yet.",
  onRead,
}: {
  items: VeriForgeNotification[];
  loading?: boolean;
  emptyLabel?: string;
  onRead?: (id: string) => void;
}) {
  if (loading) {
    return <p className="px-4 py-6 text-sm text-zinc-500">Loading…</p>;
  }
  if (!items.length) {
    return <p className="px-4 py-6 text-sm text-zinc-500">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-zinc-100">
      {items.map((item) => (
        <li key={item.id}>
          <NotificationItem item={item} onRead={onRead} />
        </li>
      ))}
    </ul>
  );
}
