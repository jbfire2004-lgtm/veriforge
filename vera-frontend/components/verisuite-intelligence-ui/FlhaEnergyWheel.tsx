"use client";

/**
 * FLHA Energy Wheel — radial coverage scores + selectable energy blocks.
 * Desktop: radial SVG wheel + legend; tablet: responsive tile grid.
 */

import { VS_COLORS, VS_MOTION, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

export type FlhaEnergyItem = {
  key: string;
  label: string;
  /** Coverage / control adequacy 0–100 */
  score: number;
  flagged?: boolean;
};

type Props = {
  title?: string;
  energies: FlhaEnergyItem[];
  onSelect?: (key: string) => void;
  selectedKey?: string | null;
  /** Compact for side panels (tile grid only) */
  compact?: boolean;
};

function scoreColor(score: number, flagged?: boolean): string {
  if (flagged || score < 60) return VS_COLORS.critical;
  if (score < 75) return VS_COLORS.orange;
  return VS_COLORS.emerald;
}

/** Canonical Energy Wheel keys for FLHA */
export const FLHA_ENERGY_KEYS = [
  "gravity",
  "motion",
  "mechanical",
  "electrical",
  "pressure",
  "chemical",
  "biological",
  "radiation",
  "sound",
  "temperature",
] as const;

export function FlhaEnergyWheel({
  title = "Energy Wheel",
  energies,
  onSelect,
  selectedKey,
  compact,
}: Props) {
  const n = Math.max(energies.length, 1);
  const cx = 110;
  const cy = 110;
  const outerR = 88;
  const innerR = 36;

  return (
    <div className="vs-panel p-4" style={{ borderRadius: VS_RADIUS }}>
      <p className="vs-eyebrow">{title}</p>

      {/* Radial wheel — desktop / non-compact */}
      {!compact ? (
        <div className="mt-3 hidden justify-center sm:flex">
          <svg
            width={220}
            height={220}
            viewBox="0 0 220 220"
            role="img"
            aria-label={title}
          >
            {energies.map((e, i) => {
              const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
              const scoreR = innerR + ((outerR - innerR) * e.score) / 100;
              const color = scoreColor(e.score, e.flagged);
              const selected = selectedKey === e.key;
              const mid = (a0 + a1) / 2;
              const lx = cx + Math.cos(mid) * (outerR + 14);
              const ly = cy + Math.sin(mid) * (outerR + 14);

              const wedge = (r: number) => {
                const x0 = cx + Math.cos(a0) * r;
                const y0 = cy + Math.sin(a0) * r;
                const x1 = cx + Math.cos(a1) * r;
                const y1 = cy + Math.sin(a1) * r;
                const large = a1 - a0 > Math.PI ? 1 : 0;
                return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
              };

              return (
                <g
                  key={e.key}
                  style={{
                    cursor: onSelect ? "pointer" : "default",
                    transition: `opacity ${VS_MOTION.fast} ${VS_MOTION.ease}`,
                    opacity: selectedKey && !selected ? 0.4 : 1,
                  }}
                  onClick={() => onSelect?.(e.key)}
                >
                  <path d={wedge(outerR)} fill={VS_COLORS.panel} stroke={VS_COLORS.border} />
                  <path
                    d={wedge(scoreR)}
                    fill={color}
                    fillOpacity={selected ? 0.9 : 0.65}
                    stroke={selected ? VS_COLORS.blue : "transparent"}
                    strokeWidth={selected ? 2 : 0}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={VS_COLORS.muted}
                    fontSize={8}
                    fontWeight={600}
                  >
                    {e.label.slice(0, 6)}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={innerR - 2} fill={VS_COLORS.navy} stroke={VS_COLORS.border} />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fill={VS_COLORS.white}
              fontSize={12}
              fontWeight={600}
            >
              FLHA
            </text>
          </svg>
        </div>
      ) : null}

      {/* Tile grid — always on tablet/mobile; also compact mode */}
      <div
        className={`mt-3 grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}
      >
        {energies.map((e) => {
          const color = scoreColor(e.score, e.flagged);
          const selected = selectedKey === e.key;
          return (
            <button
              key={e.key}
              type="button"
              disabled={!onSelect}
              className={`vs-panel p-3 text-left ${onSelect ? "vs-panel-interactive" : ""} ${selected ? "vs-panel-expanded" : ""}`}
              style={{
                borderColor: selected ? VS_COLORS.blue : VS_COLORS.border,
                background: VS_COLORS.panel,
                cursor: onSelect ? "pointer" : "default",
                borderRadius: VS_RADIUS,
                minHeight: compact ? 64 : 72,
              }}
              onClick={() => onSelect?.(e.key)}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: VS_COLORS.muted }}
              >
                {e.label}
              </p>
              <p
                className={`mt-1 font-semibold tabular-nums ${compact ? "text-lg" : "text-xl"}`}
                style={{ color }}
              >
                {e.score}
              </p>
              {e.flagged ? (
                <p className="mt-1 text-[10px] uppercase" style={{ color: VS_COLORS.critical }}>
                  AI flag
                </p>
              ) : (
                <div
                  className="mt-2 h-1 w-full overflow-hidden"
                  style={{ background: VS_COLORS.border, borderRadius: VS_RADIUS }}
                >
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, e.score))}%`,
                      height: "100%",
                      background: color,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
