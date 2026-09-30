"use client";

/**
 * ERP scenario cards — generator / library selection surfaces.
 */

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type ErpScenarioCardItem = {
  id: string;
  title: string;
  scenario:
    | "electrical"
    | "fall"
    | "trench"
    | "chemical"
    | "rollover"
    | "general"
    | string;
  regionCode?: string;
  qualityScore?: number | null;
  drillReadinessPct?: number | null;
  status?: "draft" | "active" | "archived" | string;
  lastDrillAt?: string | null;
  selected?: boolean;
};

type Props = {
  title?: string;
  items: ErpScenarioCardItem[];
  onSelect?: (id: string) => void;
  onSimulate?: (id: string) => void;
};

const SCENARIO_ACCENT: Record<string, string> = {
  fall: VS_COLORS.critical,
  electrical: VS_COLORS.orange,
  trench: VS_COLORS.blue,
  chemical: VS_COLORS.emerald,
  rollover: VS_COLORS.orange,
  general: VS_COLORS.muted,
};

export function ErpScenarioCards({
  title = "ERP scenarios",
  items,
  onSelect,
  onSimulate,
}: Props) {
  return (
    <div className="vs-panel p-4">
      <p className="vs-eyebrow">{title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const accent = SCENARIO_ACCENT[item.scenario] ?? VS_COLORS.blue;
          const selected = Boolean(item.selected);
          return (
            <div
              key={item.id}
              className={`vs-panel p-3 ${onSelect ? "vs-panel-interactive" : ""} ${selected ? "vs-panel-expanded" : ""}`}
              style={{
                background: VS_COLORS.panel,
                borderLeftWidth: 3,
                borderLeftColor: accent,
              }}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(item.id)}
              onKeyDown={
                onSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(item.id);
                      }
                    }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    {item.scenario}
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {item.title}
                  </p>
                </div>
                {item.qualityScore != null ? (
                  <span
                    className="tabular-nums text-lg font-semibold"
                    style={{ color: VS_COLORS.blue }}
                  >
                    {item.qualityScore}
                  </span>
                ) : null}
              </div>
              <div
                className="mt-2 flex flex-wrap gap-3 text-[11px]"
                style={{ color: VS_COLORS.muted }}
              >
                {item.regionCode ? <span>{item.regionCode}</span> : null}
                {item.drillReadinessPct != null ? (
                  <span>Drill {item.drillReadinessPct}%</span>
                ) : null}
                {item.status ? <span className="capitalize">{item.status}</span> : null}
              </div>
              {onSimulate ? (
                <button
                  type="button"
                  className="vs-btn mt-3 w-full justify-center"
                  style={{ height: "1.85rem", fontSize: "0.75rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulate(item.id);
                  }}
                >
                  Simulate
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
