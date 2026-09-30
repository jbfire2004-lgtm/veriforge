"use client";

/**
 * JHA hazard / control / PPE blocks for Smart Builder and template views.
 */

import { VS_COLORS, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

export type JhaHazardBlockItem = {
  id: string;
  label: string;
  severity?: "low" | "moderate" | "elevated" | "critical" | string;
  likelihood?: string;
  controls?: string[];
  ppe?: string[];
  energyTypes?: string[];
  confidence?: number;
  source?: "template" | "ai" | "manual" | string;
  selected?: boolean;
};

type Props = {
  title?: string;
  hazards: JhaHazardBlockItem[];
  onToggle?: (id: string) => void;
};

const SEV: Record<string, string> = {
  low: VS_COLORS.emerald,
  moderate: VS_COLORS.blue,
  elevated: VS_COLORS.orange,
  critical: VS_COLORS.critical,
};

export function JhaHazardBlocks({
  title = "Hazards · controls · PPE",
  hazards,
  onToggle,
}: Props) {
  return (
    <div className="vs-panel p-4" style={{ borderRadius: VS_RADIUS }}>
      <p className="vs-eyebrow">{title}</p>
      <div className="mt-3 space-y-2">
        {hazards.map((h) => {
          const sevColor = SEV[h.severity ?? ""] ?? VS_COLORS.muted;
          const selected = Boolean(h.selected);
          return (
            <div
              key={h.id}
              className={`vs-panel p-3 ${onToggle ? "vs-panel-interactive" : ""} ${selected ? "vs-panel-expanded" : ""}`}
              style={{
                borderColor: selected ? VS_COLORS.blue : VS_COLORS.border,
                background: VS_COLORS.panel,
                borderRadius: VS_RADIUS,
              }}
              role={onToggle ? "button" : undefined}
              tabIndex={onToggle ? 0 : undefined}
              onClick={() => onToggle?.(h.id)}
              onKeyDown={
                onToggle
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggle(h.id);
                      }
                    }
                  : undefined
              }
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>
                  {h.label}
                </p>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide">
                  {h.severity ? (
                    <span style={{ color: sevColor }}>{h.severity}</span>
                  ) : null}
                  {h.source ? (
                    <span style={{ color: VS_COLORS.muted }}>{h.source}</span>
                  ) : null}
                  {h.confidence != null ? (
                    <span style={{ color: VS_COLORS.muted }}>
                      {Math.round(h.confidence * 100)}%
                    </span>
                  ) : null}
                </div>
              </div>
              {h.energyTypes?.length ? (
                <p className="mt-1 text-[11px]" style={{ color: VS_COLORS.blue }}>
                  Energies: {h.energyTypes.join(" · ")}
                </p>
              ) : null}
              {h.controls?.length ? (
                <ul className="mt-2 space-y-0.5 text-xs" style={{ color: VS_COLORS.muted }}>
                  {h.controls.map((c) => (
                    <li key={c}>
                      <span style={{ color: VS_COLORS.emerald }}>Ctrl</span> {c}
                    </li>
                  ))}
                </ul>
              ) : null}
              {h.ppe?.length ? (
                <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
                  <span style={{ color: VS_COLORS.orange }}>PPE</span> {h.ppe.join(", ")}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
