"use client";

import { VS_COLORS, VS_MOTION, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  title: string;
  completionPct: number;
  ratePer200k?: number;
  aiFlagged?: number;
  period?: string;
  /** Mini spark for completion / quality trend */
  sparkline?: number[];
  interactive?: boolean;
  onClick?: () => void;
};

/**
 * Inspection trend card — completion + optional spark + /200k rate.
 */
export function InspectionTrendCard({
  title,
  completionPct,
  ratePer200k,
  aiFlagged,
  period,
  sparkline,
  interactive,
  onClick,
}: Props) {
  const max = Math.max(...(sparkline ?? [1]), 1);
  const clickable = Boolean(interactive || onClick);

  return (
    <div
      className={`vs-panel p-4 ${clickable ? "vs-panel-interactive" : ""}`}
      style={{ borderRadius: VS_RADIUS }}
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
      <p className="vs-eyebrow">{title}</p>
      {period ? (
        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
          {period}
        </p>
      ) : null}
      <p
        className="mt-3 text-3xl font-semibold tabular-nums"
        style={{ color: VS_COLORS.blue }}
      >
        {completionPct.toFixed(1)}
        <span className="ml-1 text-xs font-normal" style={{ color: VS_COLORS.muted }}>
          % complete
        </span>
      </p>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden"
        style={{ background: VS_COLORS.border, borderRadius: VS_RADIUS }}
      >
        <div
          className="h-1.5"
          style={{
            width: `${Math.min(100, completionPct)}%`,
            background: VS_COLORS.emerald,
            transition: `width ${VS_MOTION.band} ${VS_MOTION.ease}`,
            borderRadius: VS_RADIUS,
          }}
        />
      </div>
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
            strokeLinecap="square"
            pathLength={1}
            className="vs-trend-line"
            points={sparkline
              .map((v, i) => `${i * 12},${28 - (v / max) * 24}`)
              .join(" ")}
          />
        </svg>
      ) : null}
      <div className="mt-3 flex gap-4 text-xs" style={{ color: VS_COLORS.muted }}>
        {ratePer200k != null ? <span>Rate {ratePer200k.toFixed(2)}/200k</span> : null}
        {aiFlagged != null ? <span>AI flags {aiFlagged}</span> : null}
      </div>
    </div>
  );
}
