"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type VeriForgeNotificationCategory =
  | "system"
  | "training"
  | "verification"
  | "compliance"
  | "activity";

export type VeriForgeNotificationTone = "critical" | "warning" | "info" | "success";

export type VeriForgeForgeStatus = "pending" | "forged" | "verified" | "failed";

export type VeriForgeNotification = {
  id: string;
  category: VeriForgeNotificationCategory;
  tone: VeriForgeNotificationTone;
  title: string;
  message: string;
  timestamp: string;
  forgeStatus: VeriForgeForgeStatus;
  userId: number | null;
  actionLabel?: string;
  read?: boolean;
};

const tonePriority: Record<VeriForgeNotificationTone, number> = {
  critical: 100,
  warning: 70,
  info: 40,
  success: 30,
};

function groupKey(item: VeriForgeNotification): string {
  if (item.category === "training") return `training:${item.title}`;
  if (item.category === "compliance") return `compliance:${item.title}`;
  return item.id;
}

function sortQueue(list: VeriForgeNotification[]): VeriForgeNotification[] {
  return [...list].sort((a, b) => {
    const toneDiff = tonePriority[b.tone] - tonePriority[a.tone];
    if (toneDiff !== 0) return toneDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

function compactQueue(list: VeriForgeNotification[]): VeriForgeNotification[] {
  const seen = new Map<string, VeriForgeNotification>();
  for (const item of sortQueue(list)) {
    const key = groupKey(item);
    if (!seen.has(key)) seen.set(key, item);
  }
  return sortQueue(Array.from(seen.values()));
}

type NotificationContextValue = {
  queue: VeriForgeNotification[];
  unreadCount: number;
  push: (notification: Omit<VeriForgeNotification, "id" | "timestamp" | "read">) => void;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
};

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

const initialQueue: VeriForgeNotification[] = [
  {
    id: "seed-critical",
    category: "system",
    tone: "critical",
    title: "SYSTEM ALERT",
    message: "Hydraulic pressure threshold exceeded in Forge Line B.",
    timestamp: new Date().toISOString(),
    forgeStatus: "failed",
    userId: 1,
  },
  {
    id: "seed-training",
    category: "training",
    tone: "warning",
    title: "Training Overdue",
    message: "High-Heat Response recertification due in 24 hours.",
    timestamp: new Date(Date.now() - 60_000).toISOString(),
    forgeStatus: "pending",
    userId: 1,
  },
];

export function VeriForgeNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = React.useState<VeriForgeNotification[]>(initialQueue);

  const value = React.useMemo<NotificationContextValue>(
    () => ({
      queue: compactQueue(queue),
      unreadCount: queue.filter((item) => !item.read).length,
      push: (notification) => {
        setQueue((prev) =>
          compactQueue([
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...prev,
          ]),
        );
      },
      dismiss: (id) => setQueue((prev) => prev.filter((item) => item.id !== id)),
      markRead: (id) =>
        setQueue((prev) =>
          prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
        ),
      clearAll: () => setQueue([]),
    }),
    [queue],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useVeriForgeNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useVeriForgeNotifications must be used within VeriForgeNotificationProvider");
  }
  return context;
}

function toneStyles(tone: VeriForgeNotificationTone) {
  if (tone === "critical") {
    return "rounded-[3px] border-[#B33A3A] bg-[#2A2224] text-[#F0DADA] shadow-none";
  }
  if (tone === "warning") {
    return "rounded-[3px] border-[#C89F3D]/70 bg-[#2A2820] text-[#F2E8C8] shadow-[inset_3px_0_0_#C89F3D]";
  }
  if (tone === "success") {
    return "rounded-[3px] border-[#4FAF6F]/60 bg-[#1F2A24] text-[#D4EEDC] shadow-[inset_3px_0_0_#4FAF6F]";
  }
  return "rounded-[3px] border-[#5A6169] bg-[#2A2E33] text-[#F4F6F8] shadow-[inset_3px_0_0_#1E6FB8]";
}

function toneIcon(tone: VeriForgeNotificationTone) {
  if (tone === "critical") return <ForgeBoltIcon className="text-[#B33A3A]" />;
  if (tone === "warning") return <HeatEdgeIcon className="text-[#C89F3D]" />;
  if (tone === "success") return <ShieldGridIcon className="text-[#4FAF6F]" />;
  return <ShieldGridIcon className="text-[#1E6FB8]" />;
}

export function VeriForgeNotificationCard({
  item,
  onDismiss,
  onMarkRead,
}: {
  item: VeriForgeNotification;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}) {
  return (
    <article
      className={cn(
        "group border p-3 transition",
        toneStyles(item.tone),
        item.read && "opacity-75",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{toneIcon(item.tone)}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(veriforgeTypography.heading, "text-[12px] font-semibold text-inherit")}>{item.title}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="h-6 w-6 rounded-[3px] border border-[#5A6169] text-xs text-[#A8B0B8] transition hover:border-[#1E6FB8] hover:text-[#F4F6F8]"
              onClick={() => onDismiss?.(item.id)}
            >
              X
            </button>
          </div>
          <p className="text-sm leading-relaxed text-inherit">{item.message}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A8B0B8]">
            <span>{new Date(item.timestamp).toLocaleString()}</span>
            <span>userId: {item.userId ?? "N/A"}</span>
            <span>forgeStatus: {item.forgeStatus}</span>
          </div>
          {item.actionLabel ? (
            <div className="pt-1">
              <VeriForgeButton size="sm" variant="secondary">{item.actionLabel}</VeriForgeButton>
            </div>
          ) : null}
          {!item.read ? (
            <button
              type="button"
              onClick={() => onMarkRead?.(item.id)}
              className="text-xs text-[#1E6FB8] underline-offset-2 hover:underline"
            >
              Mark read
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function VeriForgeToastStack({
  className,
  limit = 4,
}: {
  className?: string;
  limit?: number;
}) {
  const { queue, dismiss, markRead } = useVeriForgeNotifications();
  const toasts = queue.slice(0, limit);

  return (
    <div className={cn("fixed right-4 top-4 z-[100] w-[360px] space-y-2", className)}>
      {toasts.map((item) => (
        <VeriForgeNotificationCard
          key={item.id}
          item={item}
          onDismiss={dismiss}
          onMarkRead={markRead}
        />
      ))}
    </div>
  );
}

export function VeriForgeInlineAlert({
  item,
  className,
}: {
  item: VeriForgeNotification;
  className?: string;
}) {
  return (
    <VeriForgeFrame className={cn("border-l-4 border-l-[#1E6FB8] px-4 py-3", className)}>
      <VeriForgeNotificationCard item={item} />
    </VeriForgeFrame>
  );
}

export function VeriForgeNotificationCenter({
  className,
}: {
  className?: string;
}) {
  const { queue, clearAll, dismiss, markRead, unreadCount } = useVeriForgeNotifications();
  return (
    <section
      className={cn(
        "rounded-[3px] border border-[#5A6169] bg-[#2A2E33] p-4 shadow-none",
        className,
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className={cn(veriforgeTypography.heading, "text-sm text-[var(--vf-color-safety-white)]")}>
            Notification Center
          </h2>
          <p className="text-xs text-[#bababa]">{unreadCount} unread in forge queue</p>
        </div>
        <VeriForgeButton size="sm" variant="ghost" onClick={clearAll}>
          Clear All
        </VeriForgeButton>
      </header>
      <VeriForgeDivider className="mb-3" />
      <div className="space-y-2">
        {queue.length === 0 ? (
          <p className="text-sm text-[#aaa]">No active notifications.</p>
        ) : (
          queue.map((item) => (
            <VeriForgeNotificationCard
              key={item.id}
              item={item}
              onDismiss={dismiss}
              onMarkRead={markRead}
            />
          ))
        )}
      </div>
    </section>
  );
}

