"use client";

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Cell = { row: string; col: string; value: number; intensity: number };

type Props = {
  title: string;
  rows: string[];
  cols: string[];
  cells: Cell[];
  onCellClick?: (cell: Cell) => void;
};

export function LeadingHeatmap({ title, rows, cols, cells, onCellClick }: Props) {
  return (
    <div className="vs-panel overflow-x-auto p-4">
      <p className="vs-eyebrow">{title}</p>
      <table className="mt-3 w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr style={{ color: VS_COLORS.muted }}>
            <th className="py-2 font-medium" />
            {cols.map((c) => (
              <th key={c} className="py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="py-1 pr-2" style={{ color: VS_COLORS.muted }}>
                {row}
              </td>
              {cols.map((col) => {
                const cell = cells.find((c) => c.row === row && c.col === col);
                const a = Math.max(0.12, Math.min(0.95, cell?.intensity ?? 0));
                const payload: Cell = cell ?? {
                  row,
                  col,
                  value: 0,
                  intensity: 0,
                };
                return (
                  <td key={col} className="p-1">
                    <button
                      type="button"
                      disabled={!onCellClick}
                      className="w-full px-2 py-2 text-center tabular-nums text-xs"
                      style={{
                        background: `rgba(0, 163, 255, ${a})`,
                        color: VS_COLORS.white,
                        cursor: onCellClick ? "pointer" : "default",
                        border: "none",
                        borderRadius: 4,
                        minHeight: 36,
                      }}
                      onClick={() => onCellClick?.(payload)}
                    >
                      {payload.value}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompetencyHeatmap(props: Props) {
  return <LeadingHeatmap {...props} />;
}
