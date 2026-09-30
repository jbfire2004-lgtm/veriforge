"use client";

import { useId, useState } from "react";
import { VS_COLORS, VS_MOTION, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

type Point = { period: string; value: number };
type Anomaly = { period: string; label?: string };

type Props = {
  title: string;
  series: Point[];
  forecast?: Point[];
  anomalies?: Anomaly[];
  rangeLabel?: string;
  /** Drill into a historical point */
  onPointClick?: (point: Point, index: number) => void;
  /** Drill into an anomaly marker */
  onAnomalyClick?: (anomaly: Anomaly) => void;
};

/**
 * Trend panel — animated polyline + dashed forecast + anomaly markers.
 * Desktop/tablet: full-width SVG; interactive hover + click for drilldown.
 */
export function TrendPanel({
  title,
  series,
  forecast = [],
  anomalies = [],
  rangeLabel = "Trend + forecast",
  onPointClick,
  onAnomalyClick,
}: Props) {
  const gid = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const all = [...series, ...forecast];
  const vals = all.map((p) => p.value);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 1);
  const w = Math.max(series.length + forecast.length, 2) * 40;
  const h = 120;
  const y = (v: number) => h - 16 - ((v - min) / (max - min || 1)) * (h - 32);
  const x = (i: number) => 20 + i * 40;
  const anomByPeriod = new Map(anomalies.map((a) => [a.period, a]));
  const interactive = Boolean(onPointClick || onAnomalyClick);
  const hoverPoint = hoverIdx != null ? series[hoverIdx] : null;

  return (
    <div className={`vs-panel p-4 ${interactive ? "vs-panel-interactive" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>
          {title}
        </h3>
        <span
          className="text-[11px] uppercase tracking-wide"
          style={{ color: VS_COLORS.muted }}
        >
          {rangeLabel}
        </span>
      </div>
      {hoverPoint ? (
        <p className="mt-1 text-xs tabular-nums" style={{ color: VS_COLORS.blue }}>
          {hoverPoint.period}: {hoverPoint.value.toFixed(2)}
        </p>
      ) : (
        <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
          {interactive ? "Hover points · click to drill" : "\u00a0"}
        </p>
      )}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2 w-full"
        style={{ maxHeight: 140 }}
        role={interactive ? "img" : undefined}
        aria-label={title}
      >
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VS_COLORS.blue} stopOpacity={0.22} />
            <stop offset="100%" stopColor={VS_COLORS.blue} stopOpacity={0} />
          </linearGradient>
        </defs>
        {series.length > 1 ? (
          <polygon
            fill={`url(#${gid}-fill)`}
            points={[
              `${x(0)},${h - 8}`,
              ...series.map((p, i) => `${x(i)},${y(p.value)}`),
              `${x(series.length - 1)},${h - 8}`,
            ].join(" ")}
          />
        ) : null}
        <polyline
          className="vs-trend-line"
          fill="none"
          stroke={VS_COLORS.blue}
          strokeWidth="2.5"
          strokeLinecap="square"
          pathLength={1}
          points={series.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")}
        />
        {forecast.length ? (
          <polyline
            fill="none"
            stroke={VS_COLORS.orange}
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="square"
            points={[
              ...series
                .slice(-1)
                .map((p, i) => `${x(series.length - 1 + i)},${y(p.value)}`),
              ...forecast.map((p, i) => `${x(series.length + i)},${y(p.value)}`),
            ].join(" ")}
          />
        ) : null}
        {series.map((p, i) => {
          const anom = anomByPeriod.get(p.period);
          const active = hoverIdx === i;
          return (
            <g key={p.period}>
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r={active ? 5 : anom ? 4 : 3}
                fill={anom ? VS_COLORS.critical : VS_COLORS.blue}
                stroke={active ? VS_COLORS.white : "transparent"}
                strokeWidth={1.5}
                style={{
                  cursor: interactive ? "pointer" : "default",
                  transition: `r ${VS_MOTION.fast} ${VS_MOTION.ease}`,
                }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onClick={() => {
                  if (anom && onAnomalyClick) onAnomalyClick(anom);
                  else onPointClick?.(p, i);
                }}
              />
              {/* Hit target ≥44px visual equiv via larger invisible circle */}
              {interactive ? (
                <circle
                  cx={x(i)}
                  cy={y(p.value)}
                  r={12}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => {
                    if (anom && onAnomalyClick) onAnomalyClick(anom);
                    else onPointClick?.(p, i);
                  }}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <div
        className="mt-1 flex justify-between text-[10px]"
        style={{ color: VS_COLORS.muted }}
      >
        <span>{series[0]?.period}</span>
        <span style={{ borderRadius: VS_RADIUS }}>{series[series.length - 1]?.period}</span>
      </div>
    </div>
  );
}
