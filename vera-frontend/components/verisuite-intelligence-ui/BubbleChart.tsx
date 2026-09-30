"use client";

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type BubblePoint = {
  id: string;
  label: string;
  /** Horizontal metric (e.g. frequency) */
  x: number;
  /** Vertical metric (e.g. severity score 0–100) */
  y: number;
  /** Bubble area metric (e.g. exposure hours) */
  r: number;
  tone?: "neutral" | "info" | "positive" | "caution" | "critical";
};

type Props = {
  title: string;
  points: BubblePoint[];
  xLabel?: string;
  yLabel?: string;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
};

const TONE: Record<NonNullable<BubblePoint["tone"]>, string> = {
  neutral: VS_COLORS.muted,
  info: VS_COLORS.blue,
  positive: VS_COLORS.emerald,
  caution: VS_COLORS.orange,
  critical: VS_COLORS.critical,
};

/**
 * Bubble chart — risk/frequency/exposure compositions (LOCKED Step 1).
 * Interactive: hover lift + click drill-down via onSelect.
 */
export function BubbleChart({
  title,
  points,
  xLabel = "Frequency",
  yLabel = "Severity",
  onSelect,
  selectedId,
}: Props) {
  const w = 320;
  const h = 200;
  const pad = 28;
  const maxX = Math.max(...points.map((p) => p.x), 1);
  const maxY = Math.max(...points.map((p) => p.y), 1);
  const maxR = Math.max(...points.map((p) => p.r), 1);

  function cx(x: number) {
    return pad + (x / maxX) * (w - pad * 2);
  }
  function cy(y: number) {
    return h - pad - (y / maxY) * (h - pad * 2);
  }
  function radius(r: number) {
    return 6 + (r / maxR) * 18;
  }

  return (
    <div className="vs-panel p-4">
      <p className="vs-eyebrow">{title}</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-3 w-full"
        role="img"
        aria-label={title}
      >
        <line
          x1={pad}
          y1={h - pad}
          x2={w - 8}
          y2={h - pad}
          stroke={VS_COLORS.border}
          strokeWidth="1"
        />
        <line
          x1={pad}
          y1={8}
          x2={pad}
          y2={h - pad}
          stroke={VS_COLORS.border}
          strokeWidth="1"
        />
        <text
          x={w / 2}
          y={h - 6}
          textAnchor="middle"
          fill={VS_COLORS.muted}
          fontSize="9"
        >
          {xLabel}
        </text>
        <text
          x={12}
          y={h / 2}
          textAnchor="middle"
          fill={VS_COLORS.muted}
          fontSize="9"
          transform={`rotate(-90 12 ${h / 2})`}
        >
          {yLabel}
        </text>
        {points.map((p) => {
          const selected = selectedId === p.id;
          const fill = TONE[p.tone ?? "info"];
          return (
            <g key={p.id}>
              <circle
                className="vs-bubble"
                cx={cx(p.x)}
                cy={cy(p.y)}
                r={radius(p.r)}
                fill={fill}
                fillOpacity={selected ? 0.85 : 0.45}
                stroke={selected ? VS_COLORS.white : fill}
                strokeWidth={selected ? 2 : 1}
                style={{ cursor: onSelect ? "pointer" : "default" }}
                onClick={() => onSelect?.(p.id)}
              >
                <title>
                  {p.label}: {xLabel} {p.x}, {yLabel} {p.y}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-2">
        {points.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="vs-chip text-[10px]"
              data-active={selectedId === p.id || undefined}
              onClick={() => onSelect?.(p.id)}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
