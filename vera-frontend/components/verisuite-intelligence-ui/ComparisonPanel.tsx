"use client";

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type ComparisonRow = {
  label: string;
  /** Left column value (company / project / region A) */
  left: number | null;
  /** Right column value (industry / peer / region B) */
  right: number | null;
  suppressed?: boolean;
  unit?: string;
};

export type ComparisonMode =
  | "entity-vs-industry"
  | "project-vs-industry"
  | "company-vs-industry"
  | "region-vs-region"
  | "project-vs-company";

const MODE_HEADERS: Record<
  ComparisonMode,
  { left: string; right: string; title: string }
> = {
  "entity-vs-industry": {
    left: "Entity",
    right: "Industry",
    title: "Entity vs industry",
  },
  "project-vs-industry": {
    left: "Project",
    right: "Industry",
    title: "Project vs industry",
  },
  "company-vs-industry": {
    left: "Company",
    right: "Industry",
    title: "Company vs industry",
  },
  "region-vs-region": {
    left: "Region A",
    right: "Region B",
    title: "Region vs region",
  },
  "project-vs-company": {
    left: "Project",
    right: "Company",
    title: "Project vs company",
  },
};

type Props = {
  title?: string;
  mode?: ComparisonMode;
  leftLabel?: string;
  rightLabel?: string;
  rows: ComparisonRow[];
  /** Compact bar visualization beside delta */
  showBars?: boolean;
};

function fmt(n: number | null | undefined, digits = 2) {
  if (n == null) return "—";
  return n.toFixed(digits);
}

/**
 * Clear side-by-side comparison with delta + optional proportional bars.
 */
export function ComparisonPanel({
  title,
  mode = "entity-vs-industry",
  leftLabel,
  rightLabel,
  rows,
  showBars = true,
}: Props) {
  const headers = MODE_HEADERS[mode];
  const left = leftLabel ?? headers.left;
  const right = rightLabel ?? headers.right;
  const panelTitle = title ?? headers.title;

  const maxAbs = Math.max(
    0.01,
    ...rows.flatMap((r) => [Math.abs(r.left ?? 0), Math.abs(r.right ?? 0)]),
  );

  return (
    <div className="vs-panel vs-compare-panel p-4" id="vs-comparison">
      <p className="vs-eyebrow">{panelTitle}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] text-left text-sm">
          <thead>
            <tr style={{ color: VS_COLORS.muted }}>
              <th className="py-2 font-medium">Metric</th>
              <th className="py-2 font-medium">{left}</th>
              <th className="py-2 font-medium">{right}</th>
              <th className="py-2 font-medium">Δ</th>
              {showBars ? <th className="py-2 font-medium hidden sm:table-cell">Relative</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const delta =
                r.suppressed || r.left == null || r.right == null
                  ? null
                  : Math.round((r.left - r.right) * 100) / 100;
              const leftW = r.left == null ? 0 : (Math.abs(r.left) / maxAbs) * 100;
              const rightW = r.right == null ? 0 : (Math.abs(r.right) / maxAbs) * 100;
              return (
                <tr key={r.label}>
                  <td className="py-2" style={{ color: VS_COLORS.white }}>
                    {r.label}
                    {r.unit ? (
                      <span className="ml-1 text-[10px] vs-muted">{r.unit}</span>
                    ) : null}
                  </td>
                  <td className="py-2 tabular-nums">
                    {r.suppressed ? "hidden" : fmt(r.left)}
                  </td>
                  <td className="py-2 tabular-nums">
                    {r.suppressed ? "—" : fmt(r.right)}
                  </td>
                  <td
                    className="py-2 tabular-nums font-medium"
                    style={{
                      color:
                        delta == null
                          ? VS_COLORS.muted
                          : delta > 0
                            ? VS_COLORS.critical
                            : delta < 0
                              ? VS_COLORS.emerald
                              : VS_COLORS.muted,
                    }}
                  >
                    {delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`}
                  </td>
                  {showBars ? (
                    <td className="py-2 hidden sm:table-cell" style={{ minWidth: 88 }}>
                      <div className="vs-compare-bars">
                        <div
                          className="vs-compare-bar"
                          style={{
                            width: `${leftW}%`,
                            background: VS_COLORS.blue,
                          }}
                          title={left}
                        />
                        <div
                          className="vs-compare-bar"
                          style={{
                            width: `${rightW}%`,
                            background: VS_COLORS.orange,
                            opacity: 0.85,
                          }}
                          title={right}
                        />
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] uppercase tracking-wide vs-muted">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-3 rounded-sm"
            style={{ background: VS_COLORS.blue }}
          />
          {left}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-3 rounded-sm"
            style={{ background: VS_COLORS.orange }}
          />
          {right}
        </span>
        <span>Δ &gt; 0 = worse than peer (rates)</span>
      </div>
    </div>
  );
}

/** Legacy row shape adapter */
export function comparisonRowsFromEntityIndustry(
  rows: Array<{
    label: string;
    entity: number | null;
    industry: number | null;
    suppressed?: boolean;
  }>,
): ComparisonRow[] {
  return rows.map((r) => ({
    label: r.label,
    left: r.entity,
    right: r.industry,
    suppressed: r.suppressed,
  }));
}
