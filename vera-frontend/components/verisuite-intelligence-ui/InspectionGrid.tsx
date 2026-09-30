"use client";

/**
 * Inspection findings / BBO grid — reusable across VeriPM inspections hubs.
 * Step 1 design system: vs-panel, IBM Plex, electric blue accents.
 */

import { VsStatusBadge } from "./VsDashboardShell";
import { VS_COLORS, type VsTone } from "@/lib/verisuite-intelligence-ui/tokens";

export type InspectionGridRow = {
  id: string;
  date: string;
  type: "bbo" | "focus" | "standard" | string;
  location?: string;
  findingsOpen: number;
  qualityScore?: number | null;
  status: "draft" | "complete" | "in_review" | string;
  inspector?: string;
};

type Props = {
  title?: string;
  rows: InspectionGridRow[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
};

function statusTone(status: string): VsTone {
  if (status === "complete") return "positive";
  if (status === "in_review" || status === "overdue") return "caution";
  if (status === "draft") return "neutral";
  return "neutral";
}

export function InspectionGrid({
  title = "Inspections",
  rows,
  onSelect,
  selectedId,
}: Props) {
  return (
    <div className="vs-panel overflow-hidden p-0">
      <div className="border-b px-4 py-3" style={{ borderColor: VS_COLORS.border }}>
        <p className="vs-eyebrow">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Location</th>
              <th>Findings</th>
              <th>Quality</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const selected = selectedId === r.id;
              return (
                <tr
                  key={r.id}
                  className={onSelect ? "vs-panel-interactive" : undefined}
                  style={
                    selected
                      ? { background: "rgba(0, 163, 255, 0.1)" }
                      : undefined
                  }
                  role={onSelect ? "button" : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  onClick={() => onSelect?.(r.id)}
                  onKeyDown={
                    onSelect
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(r.id);
                          }
                        }
                      : undefined
                  }
                >
                  <td style={{ color: VS_COLORS.muted }}>{r.date}</td>
                  <td
                    className="uppercase text-[11px] font-semibold tracking-wide"
                    style={{ color: VS_COLORS.blue }}
                  >
                    {r.type}
                  </td>
                  <td style={{ color: VS_COLORS.white }}>{r.location ?? "—"}</td>
                  <td
                    className="tabular-nums"
                    style={{
                      color:
                        r.findingsOpen > 0 ? VS_COLORS.orange : VS_COLORS.muted,
                    }}
                  >
                    {r.findingsOpen}
                  </td>
                  <td className="tabular-nums" style={{ color: VS_COLORS.white }}>
                    {r.qualityScore != null ? r.qualityScore : "—"}
                  </td>
                  <td>
                    <VsStatusBadge tone={statusTone(r.status)}>
                      {r.status.replace("_", " ")}
                    </VsStatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <p className="p-4 text-sm" style={{ color: VS_COLORS.muted }}>
          No inspections in this period.
        </p>
      ) : null}
    </div>
  );
}
