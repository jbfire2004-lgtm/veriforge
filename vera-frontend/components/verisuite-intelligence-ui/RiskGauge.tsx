"use client";

import { VS_COLORS, VS_MOTION, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  label: string;
  score: number;
  band?: string;
  max?: number;
  /** Drill / expand from gauge */
  onClick?: () => void;
};

/**
 * Radial risk gauge 0–100 — industrial square stroke caps (Step 1).
 */
export function RiskGauge({ label, score, band, max = 100, onClick }: Props) {
  const pct = Math.max(0, Math.min(1, score / max));
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const color =
    pct >= 0.75
      ? VS_COLORS.critical
      : pct >= 0.55
        ? VS_COLORS.orange
        : pct >= 0.35
          ? VS_COLORS.blue
          : VS_COLORS.emerald;

  return (
    <div
      className={`vs-panel flex flex-col items-center p-4 ${onClick ? "vs-panel-interactive" : ""}`}
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
      style={{ borderRadius: VS_RADIUS, minHeight: 44 }}
    >
      <p className="vs-eyebrow">{label}</p>
      <svg width="140" height="140" viewBox="0 0 140 140" className="mt-2" aria-hidden>
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={VS_COLORS.border}
          strokeWidth="10"
          strokeLinecap="square"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="square"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{
            transition: `stroke-dashoffset ${VS_MOTION.band} ${VS_MOTION.ease}`,
          }}
        />
        <text
          x="70"
          y="74"
          textAnchor="middle"
          fontSize="28"
          fontWeight="600"
          fill={VS_COLORS.white}
        >
          {Math.round(score)}
        </text>
      </svg>
      {band ? (
        <p className="mt-1 text-sm capitalize" style={{ color }}>
          {band}
        </p>
      ) : null}
    </div>
  );
}
