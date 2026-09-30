"use client";

import { useCallback, useEffect, useState } from "react";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import {
  NotificationBell,
  NotificationList,
} from "@/src/components/notifications";
import { Button } from "@/components/ui";
import {
  listVeriForgeNotifications,
  markAllVeriForgeNotificationsRead,
  markVeriForgeNotificationsRead,
  type VeriForgeNotification,
} from "@/lib/veriforge-notifications-api";

export default function NotificationsPage() {
  const [items, setItems] = useState<VeriForgeNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listVeriForgeNotifications({ take: 100 });
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onRead(id: string) {
    await markVeriForgeNotificationsRead([id]);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
  }

  async function onMarkAll() {
    await markAllVeriForgeNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <VeriHubConsoleShell
      title="Notifications"
      description="In-app alerts for compliance, scorecards, modules, and billing."
      actions={
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!unread}
            onClick={() => void onMarkAll()}
          >
            Mark all read
          </Button>
        </div>
      }
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <NotificationList items={items} loading={loading} onRead={onRead} />
      </div>
    </VeriHubConsoleShell>
  );
}
