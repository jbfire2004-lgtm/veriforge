"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import "@/lib/verisuite-intelligence-ui/tokens.css";
import { type VsTone, toneColor } from "@/lib/verisuite-intelligence-ui/tokens";

type Band = "kpi" | "trend" | "detail" | "narrative" | "controls";

const BAND_LABEL: Record<Band, string> = {
  controls: "Controls",
  kpi: "KPI",
  trend: "Trend",
  detail: "Detail",
  narrative: "Narrative",
};

/**
 * Premium industrial shell for all VeriSuite intelligence dashboards.
 * Hierarchy: Controls → KPI → Trend → Detail → Narrative
 * Appearance tracks app theme (light/dark parity with SMS Core).
 */
export function VsDashboardShell({
  eyebrow,
  title,
  description,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="vs-theme-auto vera-shell">
      <div className="vs-intel">
        <div className="vs-shell">
          <header className="vs-shell-header">
            <p className="vs-eyebrow">{eyebrow}</p>
            <h1 className="vs-shell-title">{title}</h1>
            <p className="vs-shell-desc">{description}</p>
            {meta ? <p className="vs-shell-meta">{meta}</p> : null}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Industrial status chip — left accent bar; platform badge radius (no pills). */
export function VsStatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: VsTone;
}) {
  const color = toneColor(tone);
  return (
    <span
      className="vs-status-badge vera-status"
      style={{
        color: tone === "neutral" ? "var(--vs-muted)" : color,
        border: "1px solid var(--vs-border)",
        background: "var(--vs-slate)",
        boxShadow: `inset 3px 0 0 ${tone === "neutral" ? "var(--vs-muted)" : color}`,
      }}
    >
      {children}
    </span>
  );
}

/** Section title row — matches SMS Core SmsSectionHeader composition. */
export function VsSectionHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="vs-section-header">
      <div className="vs-section-header-main">
        {Icon ? (
          <span className="vs-section-icon" aria-hidden>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="vs-section-title">{title}</h2>
          {description ? (
            <p className="vs-section-desc">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="vs-section-actions">{actions}</div> : null}
    </div>
  );
}

/**
 * Locked layout band. Renders SMS-style section header + spacing.
 * Prefer ModuleHubLayout for new hubs; VsSection remains the atomic band.
 */
export function VsSection({
  band,
  label,
  description,
  icon,
  actions,
  children,
  className = "",
}: {
  band: Band;
  label?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const layout =
    band === "kpi"
      ? "vs-band-kpi"
      : band === "trend"
        ? "vs-band-trend"
        : band === "detail"
          ? "vs-band-detail"
          : band === "narrative"
            ? "vs-band-narrative"
            : "";

  const title = label ?? BAND_LABEL[band];

  return (
    <section className={`vs-band ${className}`} data-band={band}>
      <VsSectionHeader
        title={title}
        description={description}
        icon={icon}
        actions={actions}
      />
      <div className={layout || undefined}>{children}</div>
    </section>
  );
}
