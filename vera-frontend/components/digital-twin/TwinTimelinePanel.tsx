"use client";

import { useTwinTimeline } from "@/lib/digital-twin";
import type { TwinType } from "@vera/digital-twin";

type Props = {
  type: TwinType;
  id: string;
  title?: string;
};

export function TwinTimelinePanel({ type, id, title = "Twin timeline" }: Props) {
  const timeline = useTwinTimeline(type, id);

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: "var(--vera-border)", background: "var(--vera-surface)" }}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
        {timeline.length === 0 && (
          <li className="text-muted-foreground">No timeline events yet.</li>
        )}
        {timeline.map((entry) => (
          <li key={entry.id} className="border-b border-border/40 pb-2 last:border-0">
            <time className="text-xs text-muted-foreground">
              {new Date(entry.at).toLocaleString()}
            </time>
            <p className="font-medium">{entry.summary}</p>
            {entry.aiSummary && (
              <p className="text-xs text-muted-foreground">{entry.aiSummary}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
