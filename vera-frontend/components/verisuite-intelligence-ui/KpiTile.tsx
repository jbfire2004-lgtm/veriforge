"use client";

import type { VsTone } from "@/lib/verisuite-intelligence-ui/tokens";
import { toneColor, VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number | null;
  sparkline?: number[];
  tone?: VsTone;
  suppressed?: boolean;
  /** Enables hover lift + blue border (drill-ready KPI) */
  interactive?: boolean;
  onClick?: () => void;
};

export function KpiTile({
  label,
  value,
  unit,
  delta,
  sparkline,
  tone = "neutral",
  suppressed,
  interactive,
  onClick,
}: Props) {
  const color = toneColor(tone);
  const max = Math.max(...(sparkline ?? [1]), 1);
  const className = [
    "vs-panel",
    "vs-kpi-tile",
    "p-4",
    interactive || onClick ? "vs-panel-interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{ minHeight: 108 }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: VS_COLORS.muted }}
      >
        {label}
      </p>
      {suppressed ? (
        <p className="mt-2 text-sm" style={{ color: VS_COLORS.orange }}>
          Hidden · n&lt;5
        </p>
      ) : (
        <>
          <p className="mt-2 text-3xl font-semibold tabular-nums" style={{ color }}>
            {value}
            {unit ? (
              <span className="ml-1 text-xs font-normal" style={{ color: VS_COLORS.muted }}>
                {unit}
              </span>
            ) : null}
          </p>
          {delta != null ? (
            <p
              className="mt-1 text-xs tabular-nums"
              style={{
                color:
                  delta > 0
                    ? VS_COLORS.critical
                    : delta < 0
                      ? VS_COLORS.emerald
                      : VS_COLORS.muted,
              }}
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "●"} {delta > 0 ? "+" : ""}
              {delta.toFixed(2)}
            </p>
          ) : null}
          {sparkline && sparkline.length > 1 ? (
            <svg
              viewBox={`0 0 ${sparkline.length * 12} 28`}
              className="vs-sparkline mt-2 h-7 w-full"
              aria-hidden
            >
              <polyline
                fill="none"
                stroke={VS_COLORS.blue}
                strokeWidth="2"
                pathLength={1}
                className="vs-trend-line"
                points={sparkline
                  .map((v, i) => `${i * 12},${28 - (v / max) * 24}`)
                  .join(" ")}
              />
            </svg>
          ) : null}
        </>
      )}
    </div>
  );
}
