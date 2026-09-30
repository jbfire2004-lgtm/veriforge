"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
};

export type TimelineProps = {
  events: TimelineEvent[];
  className?: string;
};

const toneClass = {
  default: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--badge-success-bg)] text-[var(--badge-success-fg)]",
  warning: "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-fg)]",
  danger: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-fg)]",
};

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">No history yet.</p>
    );
  }

  return (
    <ol className={cn("relative space-y-6 border-l border-[var(--border)] pl-6", className)}>
      {events.map((event) => {
        const Icon = event.icon;
        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                "absolute -left-[1.65rem] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-[var(--surface)]",
                toneClass[event.tone ?? "default"]
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
            </span>
            <p className="text-sm font-medium text-[var(--foreground)]">{event.title}</p>
            {event.description ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{event.description}</p>
            ) : null}
            <time className="mt-1 block text-xs text-[var(--muted-foreground)]">
              {event.timestamp}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
