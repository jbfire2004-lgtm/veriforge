"use client";

import { useMemo } from "react";
import { VS_COLORS, VS_MOTION, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

export type SankeyFlow = {
  rootCauseLabel: string;
  correctiveCount: number;
  preventiveCount: number;
  avgEffectiveness: number | null;
};

type Props = {
  title?: string;
  flows: SankeyFlow[];
  /** Drill into a root-cause → CA/PA linkage */
  onFlowClick?: (flow: SankeyFlow) => void;
  selectedLabel?: string | null;
};

/**
 * Sankey-style root cause → Corrective / Preventive Action flows.
 * SVG node + curved links (Step 1 industrial palette, 4px radius panels).
 */
export function RootCauseActionFlow({
  title = "Root cause → Action Management",
  flows,
  onFlowClick,
  selectedLabel,
}: Props) {
  const layout = useMemo(() => {
    const rowH = 56;
    const padY = 28;
    const leftX = 8;
    const midX = 200;
    const rightX = 320;
    const h = Math.max(padY * 2 + flows.length * rowH, 120);
    const nodes = flows.map((f, i) => {
      const y = padY + i * rowH + rowH / 2;
      const total = f.correctiveCount + f.preventiveCount;
          return { f, y, total };
    });
    return { rowH, leftX, midX, rightX, h, nodes, w: 360 };
  }, [flows]);

  const maxTotal = Math.max(1, ...layout.nodes.map((n) => n.total));

  function linkPath(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): string {
    const mx = (x0 + x1) / 2;
    return `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }

  return (
    <div className="vs-panel p-4" id="vs-root-cause-flow" style={{ borderRadius: VS_RADIUS }}>
      <p className="vs-eyebrow">{title}</p>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] uppercase tracking-wide vs-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-3" style={{ background: VS_COLORS.blue }} />
          Corrective
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-3" style={{ background: VS_COLORS.orange }} />
          Preventive
        </span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.w} ${layout.h}`}
          className="w-full min-w-[320px]"
          style={{ maxHeight: 280 }}
          role="img"
          aria-label={title}
        >
          <text x={layout.leftX} y={14} fill={VS_COLORS.muted} fontSize={9} fontWeight={600}>
            ROOT CAUSE
          </text>
          <text x={layout.midX - 8} y={14} fill={VS_COLORS.muted} fontSize={9} fontWeight={600}>
            CA
          </text>
          <text x={layout.rightX - 8} y={14} fill={VS_COLORS.muted} fontSize={9} fontWeight={600}>
            PA
          </text>

          {layout.nodes.map(({ f, y, total }) => {
            const selected = selectedLabel === f.rootCauseLabel;
            const strokeW = 2 + (total / maxTotal) * 10;
            const caY = y - 8;
            const paY = y + 8;
            return (
              <g
                key={f.rootCauseLabel}
                style={{
                  cursor: onFlowClick ? "pointer" : "default",
                  opacity: selectedLabel && !selected ? 0.45 : 1,
                  transition: `opacity ${VS_MOTION.fast} ${VS_MOTION.ease}`,
                }}
                onClick={() => onFlowClick?.(f)}
              >
                {/* Links */}
                <path
                  d={linkPath(layout.leftX + 110, y, layout.midX, caY)}
                  fill="none"
                  stroke={VS_COLORS.blue}
                  strokeWidth={Math.max(2, strokeW * (f.correctiveCount / (total || 1)))}
                  strokeOpacity={0.55}
                />
                <path
                  d={linkPath(layout.leftX + 110, y, layout.rightX, paY)}
                  fill="none"
                  stroke={VS_COLORS.orange}
                  strokeWidth={Math.max(2, strokeW * (f.preventiveCount / (total || 1)))}
                  strokeOpacity={0.55}
                />
                {/* Source node */}
                <rect
                  x={layout.leftX}
                  y={y - 14}
                  width={108}
                  height={28}
                  rx={4}
                  fill={selected ? VS_COLORS.slate : VS_COLORS.panel}
                  stroke={selected ? VS_COLORS.blue : VS_COLORS.border}
                  strokeWidth={selected ? 1.5 : 1}
                />
                <text
                  x={layout.leftX + 8}
                  y={y + 4}
                  fill={VS_COLORS.white}
                  fontSize={10}
                  fontWeight={600}
                >
                  {f.rootCauseLabel.length > 16
                    ? `${f.rootCauseLabel.slice(0, 14)}…`
                    : f.rootCauseLabel}
                </text>
                {/* CA / PA nodes */}
                <rect
                  x={layout.midX - 18}
                  y={caY - 12}
                  width={36}
                  height={24}
                  rx={4}
                  fill={VS_COLORS.panel}
                  stroke={VS_COLORS.blue}
                />
                <text
                  x={layout.midX}
                  y={caY + 4}
                  textAnchor="middle"
                  fill={VS_COLORS.blue}
                  fontSize={11}
                  fontWeight={600}
                >
                  {f.correctiveCount}
                </text>
                <rect
                  x={layout.rightX - 18}
                  y={paY - 12}
                  width={36}
                  height={24}
                  rx={4}
                  fill={VS_COLORS.panel}
                  stroke={VS_COLORS.orange}
                />
                <text
                  x={layout.rightX}
                  y={paY + 4}
                  textAnchor="middle"
                  fill={VS_COLORS.orange}
                  fontSize={11}
                  fontWeight={600}
                >
                  {f.preventiveCount}
                </text>
                {f.avgEffectiveness != null ? (
                  <text
                    x={layout.rightX + 28}
                    y={y + 4}
                    fill={VS_COLORS.muted}
                    fontSize={9}
                  >
                    eff {f.avgEffectiveness.toFixed(0)}
                  </text>
                ) : null}
                {/* Invisible hit row */}
                <rect
                  x={0}
                  y={y - layout.rowH / 2 + 4}
                  width={layout.w}
                  height={layout.rowH - 8}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
