"use client";

import { sfCn } from "../theme/cn";

export type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const DOT: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  default: "bg-[var(--sf-primary)]",
  success: "bg-[var(--sf-success)]",
  warning: "bg-[var(--sf-warning)]",
  danger: "bg-[var(--sf-danger)]",
};

export function SfTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-0 border-l-2 border-[var(--sf-border)] pl-6">
      {events.map((ev, i) => (
        <li key={ev.id} className="sf-animate-in pb-8 last:pb-0" style={{ animationDelay: `${i * 50}ms` }}>
          <span
            className={sfCn(
              "absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full ring-4 ring-[var(--sf-surface)]",
              DOT[ev.tone ?? "default"],
            )}
          />
          <p className="text-sm font-medium text-[var(--sf-text)]">{ev.title}</p>
          <p className="text-xs text-[var(--sf-text-muted)]">{ev.time}</p>
          {ev.description ? (
            <p className="mt-1 text-sm text-[var(--sf-text-subtle)]">{ev.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
