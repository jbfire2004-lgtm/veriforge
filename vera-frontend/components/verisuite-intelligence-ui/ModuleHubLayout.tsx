"use client";

import type { ReactNode } from "react";
import { InsightStrip, type InsightChip } from "./InsightStrip";
import { VsDashboardShell, VsSection } from "./VsDashboardShell";

/**
 * Shared VeriSuite / SMS hub template.
 * Locked band order: Controls → InsightStrip → KPI → Trend → Detail → Narrative
 * Keeps VsDashboardShell (design-lock) while enforcing SMS Core composition.
 */
export type ModuleHubSection = {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
};

export type ModuleHubLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  /** @deprecated Shell always tracks app theme via vs-theme-auto */
  appearance?: "dark" | "light" | "auto";
  controls?: ReactNode;
  insights?: InsightChip[];
  insightsCached?: boolean;
  kpis?: ReactNode;
  trends?: ReactNode;
  details?: ModuleHubSection[];
  narrative?: ReactNode;
  children?: ReactNode;
};

export function ModuleHubLayout({
  eyebrow,
  title,
  description,
  meta,
  controls,
  insights,
  insightsCached,
  kpis,
  trends,
  details,
  narrative,
  children,
}: ModuleHubLayoutProps) {
  return (
    <VsDashboardShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      meta={meta}
    >
      {controls ? <VsSection band="controls">{controls}</VsSection> : null}

      {insights && insights.length > 0 ? (
        <InsightStrip chips={insights} cachedHint={insightsCached} />
      ) : null}

      {kpis ? <VsSection band="kpi">{kpis}</VsSection> : null}

      {trends ? <VsSection band="trend">{trends}</VsSection> : null}

      {details?.map((d) => (
        <VsSection
          key={d.id}
          band="detail"
          label={d.label}
          description={d.description}
        >
          {d.children}
        </VsSection>
      ))}

      {narrative ? <VsSection band="narrative">{narrative}</VsSection> : null}

      {children}
    </VsDashboardShell>
  );
}

export { VsSectionHeader, VsStatusBadge } from "./VsDashboardShell";
