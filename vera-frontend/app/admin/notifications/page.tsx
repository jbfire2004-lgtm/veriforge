"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  runNotificationScheduler,
  type NotificationRow,
} from "@/lib/api/notifications";
import {
  Badge,
  Button,
  Card,
  CardContent,
  ErrorState,
  Skeleton,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function NotificationCenterPage() {
  const [items, setItems] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await listNotifications());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRunScheduler() {
    setBusy(true);
    try {
      await runNotificationScheduler();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scheduler failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Notification center"
      description="In-app alerts for inspections, competency, PPE, maintenance, calibration, and assignments."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Notifications" },
      ]}
      actions={
        <section className="flex flex-wrap gap-2">
          <Link
            href="/admin/settings/notifications"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Settings
          </Link>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void onRunScheduler()}>
            Run scheduler
          </Button>
        </section>
      }
    >
      {items === null ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : error ? (
        <ErrorState title="Unable to load" description={error} />
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {items.length > 0 && (
              <header className="flex justify-end px-4 py-3">
                <button
                  type="button"
                  className="text-sm text-teal-600 hover:underline"
                  onClick={async () => {
                    await markAllNotificationsRead();
                    await load();
                  }}
                >
                  Mark all read
                </button>
              </header>
            )}
            {items.length === 0 && (
              <p className="p-8 text-center text-muted-foreground">No notifications yet.</p>
            )}
            {items.map((n) => (
              <article
                key={n.id}
                className={`flex flex-col gap-1 px-4 py-4 ${!n.readAt ? "bg-teal-50/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{n.title ?? n.type}</h3>
                  {!n.readAt && (
                    <Badge variant="outline">Unread</Badge>
                  )}
                </div>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="text-xs text-muted-foreground">
                  {n.channel} · {new Date(n.createdAt).toLocaleString()}
                </p>
                {!n.readAt && (
                  <button
                    type="button"
                    className="mt-1 self-start text-xs text-teal-600 hover:underline"
                    onClick={async () => {
                      await markNotificationRead(n.id);
                      await load();
                    }}
                  >
                    Mark read
                  </button>
                )}
              </article>
            ))}
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}
