"use client";

import { VS_COLORS, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

type Segment = { label: string; share: number; color?: string };

type Props = {
  title: string;
  segments: Segment[];
  onSegmentClick?: (segment: Segment, index: number) => void;
  selectedLabel?: string | null;
};

/**
 * Severity distribution bars — stacked share + legend (no rounded-full).
 */
export function SeverityBars({
  title,
  segments,
  onSegmentClick,
  selectedLabel,
}: Props) {
  const total = segments.reduce((s, x) => s + x.share, 0) || 1;
  const palette = [
    VS_COLORS.emerald,
    VS_COLORS.blue,
    VS_COLORS.orange,
    VS_COLORS.critical,
  ];
  return (
    <div className="vs-panel p-4" style={{ borderRadius: VS_RADIUS }}>
      <p className="vs-eyebrow">{title}</p>
      <div
        className="mt-3 flex h-3 w-full overflow-hidden"
        style={{ background: VS_COLORS.border, borderRadius: VS_RADIUS }}
      >
        {segments.map((s, i) => {
          const color = s.color ?? palette[i % palette.length];
          const selected = selectedLabel === s.label;
          return (
            <button
              key={s.label}
              type="button"
              disabled={!onSegmentClick}
              title={`${s.label}: ${s.share}`}
              className="border-0 p-0"
              style={{
                width: `${(s.share / total) * 100}%`,
                background: color,
                cursor: onSegmentClick ? "pointer" : "default",
                opacity: selectedLabel && !selected ? 0.45 : 1,
                minWidth: s.share > 0 ? 4 : 0,
              }}
              onClick={() => onSegmentClick?.(s, i)}
            />
          );
        })}
      </div>
      <ul className="mt-3 space-y-1 text-sm" style={{ color: VS_COLORS.muted }}>
        {segments.map((s, i) => {
          const color = s.color ?? palette[i % palette.length];
          const selected = selectedLabel === s.label;
          return (
            <li key={s.label}>
              <button
                type="button"
                disabled={!onSegmentClick}
                className="flex w-full items-center justify-between border-0 bg-transparent p-0 text-left"
                style={{
                  cursor: onSegmentClick ? "pointer" : "default",
                  minHeight: 28,
                  color: selected ? VS_COLORS.white : undefined,
                }}
                onClick={() => onSegmentClick?.(s, i)}
              >
                <span>
                  <span
                    className="mr-2 inline-block h-2 w-2"
                    style={{ background: color, borderRadius: VS_RADIUS }}
                  />
                  {s.label}
                </span>
                <span className="tabular-nums" style={{ color: VS_COLORS.white }}>
                  {Math.round((s.share / total) * 100)}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
