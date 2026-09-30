"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui";
import { NotificationList } from "./NotificationList";
import {
  listVeriForgeNotifications,
  markVeriForgeNotificationsRead,
  type VeriForgeNotification,
} from "@/lib/veriforge-notifications-api";
import { getVeriHubSession } from "@/lib/verihub-org-api";

/**
 * VeriForge SaaS notification bell (org session).
 * Distinct from Nest Core `components/notifications/NotificationBell`.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<VeriForgeNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!getVeriHubSession()) {
      setItems([]);
      setUnread(0);
      return;
    }
    setLoading(true);
    try {
      const data = await listVeriForgeNotifications({ take: 12 });
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(t);
  }, [refresh]);

  async function onRead(id: string) {
    try {
      await markVeriForgeNotificationsRead([id]);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative h-9 w-9 p-0"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void refresh();
        }}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
            <p className="text-sm font-medium">Notifications</p>
            <Link
              href="/notifications"
              className="text-xs text-sky-700 underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <div className="max-h-80 overflow-auto">
            <NotificationList
              items={items}
              loading={loading}
              onRead={onRead}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
