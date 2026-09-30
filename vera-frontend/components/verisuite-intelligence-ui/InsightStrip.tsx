"use client";

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type InsightChip = {
  id: string;
  label: string;
  value?: string;
  tone?: "neutral" | "positive" | "caution" | "alert" | "info";
  /** Scroll target id within the dashboard */
  href?: string;
};

const toneColor: Record<NonNullable<InsightChip["tone"]>, string> = {
  neutral: VS_COLORS.muted,
  positive: VS_COLORS.emerald,
  caution: VS_COLORS.orange,
  alert: VS_COLORS.critical,
  info: VS_COLORS.blue,
};

type Props = {
  title?: string;
  chips: InsightChip[];
  cachedHint?: boolean;
};

/**
 * At-a-glance insight strip — key signals in one row, one click to detail.
 */
export function InsightStrip({
  title = "Key insights",
  chips,
  cachedHint,
}: Props) {
  if (!chips.length) return null;
  return (
    <div className="vs-insight-strip">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="vs-eyebrow">{title}</p>
        {cachedHint ? (
          <span className="text-[10px] uppercase tracking-wide vs-muted">Cached aggregate</span>
        ) : null}
      </div>
      <div className="vs-insight-chips">
        {chips.map((c) => {
          const color = toneColor[c.tone ?? "neutral"];
          const inner = (
            <>
              <span className="vs-insight-chip-label">{c.label}</span>
              {c.value ? (
                <span className="vs-insight-chip-value" style={{ color }}>
                  {c.value}
                </span>
              ) : null}
            </>
          );
          if (c.href) {
            return (
              <a
                key={c.id}
                href={c.href}
                className="vs-insight-chip vs-panel-interactive"
                style={{ borderLeftColor: color }}
              >
                {inner}
              </a>
            );
          }
          return (
            <div
              key={c.id}
              className="vs-insight-chip"
              style={{ borderLeftColor: color }}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
