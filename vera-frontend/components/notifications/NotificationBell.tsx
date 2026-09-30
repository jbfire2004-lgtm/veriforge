"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/lib/api/notifications";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      setCount(res.count);
    } catch {
      setCount(0);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listNotifications();
      setItems(rows);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    const t = setInterval(() => void refreshCount(), 60_000);
    return () => clearInterval(t);
  }, [refreshCount]);

  useEffect(() => {
    if (open && items === null) void loadItems();
  }, [open, items, loadItems]);

  async function onMarkRead(id: number) {
    await markNotificationRead(id);
    setItems((prev) =>
      prev?.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)) ?? [],
    );
    void refreshCount();
  }

  async function onMarkAllRead() {
    await markAllNotificationsRead();
    setItems((prev) => prev?.map((n) => ({ ...n, readAt: new Date().toISOString() })) ?? []);
    setCount(0);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 p-0 text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.14)] hover:text-[#F4F6F8] focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-[#2A2E33]"
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-[#8F2E2E] bg-[#B33A3A] px-1 text-[10px] font-bold text-[#F4F6F8]">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <Card className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,24rem)] rounded-[3px] border border-[#5A6169] bg-[#3B3F45] text-[#F4F6F8] shadow-none">
            <CardContent className="p-0">
              <header className="flex items-center justify-between border-b border-[#5A6169] px-4 py-3">
                <p className="text-sm font-semibold text-[#F4F6F8]">Notifications</p>
                {count > 0 && (
                  <button
                    type="button"
                    className="text-xs text-[#1E6FB8] hover:underline"
                    onClick={() => void onMarkAllRead()}
                  >
                    Mark all read
                  </button>
                )}
              </header>
              <div className="max-h-80 overflow-y-auto">
                {loading && (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                {!loading && items?.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
                )}
                {!loading &&
                  items?.map((n) => {
                    const payload = n.payload as { url?: string } | null | undefined;
                    const href = payload?.url;
                    const inner = (
                      <>
                        <p className="font-medium">{n.title ?? n.type}</p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-muted-foreground">{n.body}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </>
                    );
                    return href ? (
                      <Link
                        key={n.id}
                        href={href}
                        className={cn(
                          "block w-full border-b px-4 py-3 text-left text-sm hover:bg-muted/50",
                          !n.readAt && "bg-teal-50/50",
                        )}
                        onClick={() => {
                          if (!n.readAt) void onMarkRead(n.id);
                          setOpen(false);
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        key={n.id}
                        type="button"
                        className={cn(
                          "w-full border-b px-4 py-3 text-left text-sm hover:bg-muted/50",
                          !n.readAt && "bg-teal-50/50",
                        )}
                        onClick={() => {
                          if (!n.readAt) void onMarkRead(n.id);
                        }}
                      >
                        {inner}
                      </button>
                    );
                  })}
              </div>
              <footer className="border-t px-4 py-2">
                <Link
                  href="/admin/notifications"
                  className={buttonStyles({ variant: "ghost", size: "sm", className: "w-full" })}
                  onClick={() => setOpen(false)}
                >
                  View all
                </Link>
              </footer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
