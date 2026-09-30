"use client";

import { cn } from "@/src/lib/utils";
import type { VeriForgeNotification } from "@/lib/veriforge-notifications-api";

const TYPE_LABEL: Record<string, string> = {
  compliance_expiry: "Compliance",
  scorecard_update: "Scorecard",
  billing_issue: "Billing",
  module_update: "Modules",
  system_alert: "System",
};

export function NotificationItem({
  item,
  onRead,
}: {
  item: VeriForgeNotification;
  onRead?: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full border-b border-zinc-100 px-4 py-3 text-left transition hover:bg-zinc-50",
        !item.read && "bg-sky-50/60",
      )}
      onClick={() => {
        if (!item.read) onRead?.(item.id);
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-900">{item.title}</p>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">
          {TYPE_LABEL[item.type] ?? item.type}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-600 line-clamp-2">{item.message}</p>
      <p className="mt-1 text-[10px] text-zinc-400">
        {new Date(item.createdAt).toLocaleString()}
        {!item.read ? " · Unread" : ""}
      </p>
    </button>
  );
}
