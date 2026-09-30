"use client";

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type RegionNode = {
  code: string;
  label: string;
  level?: string;
  available?: boolean;
  hotspotScore?: number;
};

type Props = {
  breadcrumbs: RegionNode[];
  children: RegionNode[];
  activeCode: string;
  onSelect: (code: string) => void;
};

export function RegionalMapPanel({
  breadcrumbs,
  children,
  activeCode,
  onSelect,
}: Props) {
  return (
    <div className="vs-panel p-4">
      <p className="vs-eyebrow">Regional drilldown</p>
      <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
        Global → Continent → Country → Province/State → Region → City → Site
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {breadcrumbs.map((b, i) => (
          <span key={b.code} className="flex items-center gap-2">
            {i > 0 ? <span style={{ color: VS_COLORS.muted }}>/</span> : null}
            <button
              type="button"
              onClick={() => onSelect(b.code)}
              className={
                b.code === activeCode
                  ? "vs-drill-crumb-active"
                  : "vs-drill-crumb"
              }
            >
              {b.label}
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {children.map((c) => {
          const unavailable = c.available === false;
          const active = c.code === activeCode;
          return (
            <button
              key={c.code}
              type="button"
              disabled={unavailable}
              onClick={() => onSelect(c.code)}
              className="vs-region-chip"
              data-active={active ? "true" : undefined}
              title={
                unavailable
                  ? "Not available for this entitlement"
                  : c.hotspotScore != null
                    ? `Hotspot ${c.hotspotScore}`
                    : undefined
              }
            >
              {c.label}
              {c.level ? (
                <span
                  className="ml-1 text-[10px] uppercase"
                  style={{ color: VS_COLORS.muted }}
                >
                  {c.level}
                </span>
              ) : null}
              {c.hotspotScore != null && c.hotspotScore >= 70 ? (
                <span
                  className="ml-1 text-[10px] font-bold"
                  style={{ color: VS_COLORS.orange }}
                >
                  ●
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
