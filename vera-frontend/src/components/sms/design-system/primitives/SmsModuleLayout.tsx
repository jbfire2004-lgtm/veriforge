"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import { SmsPageLayout } from "./SmsPageLayout";
import { SmsCard } from "./SmsCard";
import { SmsSection } from "./SmsSection";

export type SmsModuleSectionDef = {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  /** Render as card surface (default true) */
  card?: boolean;
};

export type SmsModuleStat = {
  id: string;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "info" | "positive" | "caution" | "critical";
  icon?: LucideIcon;
};

export type SmsModuleLayoutProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  /** Top control strip (tabs, plane switchers) */
  controls?: ReactNode;
  /** KPI / stat cards row */
  stats?: SmsModuleStat[];
  /** Ordered content sections */
  sections?: SmsModuleSectionDef[];
  /** Escape hatch — rendered after stats, before sections */
  children?: ReactNode;
  footer?: ReactNode;
  width?: "default" | "narrow" | "full";
  className?: string;
};

const STAT_TONE: Record<
  NonNullable<SmsModuleStat["tone"]>,
  string
> = {
  default: "border-[var(--sf-border)]",
  info: "border-[color-mix(in_srgb,var(--sf-accent)_55%,var(--sf-border))]",
  positive:
    "border-[color-mix(in_srgb,var(--sf-success)_55%,var(--sf-border))]",
  caution:
    "border-[color-mix(in_srgb,var(--sf-warning)_55%,var(--sf-border))]",
  critical:
    "border-[color-mix(in_srgb,var(--sf-danger)_55%,var(--sf-border))]",
};

/**
 * Canonical SMS Core module template.
 * Prefer `SmsUniversalLayout` for new pages (Header → Summary → Main → Actions → Footer).
 * This API remains compatible: header actions + stats + sections + footer.
 * Theme: inherits `.sf-theme` light/dark tokens.
 */
export function SmsModuleLayout({
  eyebrow,
  title,
  description,
  meta,
  filters,
  actions,
  mobileActions,
  controls,
  stats,
  sections,
  children,
  footer,
  width = "default",
  className,
}: SmsModuleLayoutProps) {
  /* Lazy-compatible: keep composition here to avoid circular import with Universal. */
  return (
    <SmsPageLayout
      eyebrow={eyebrow}
      title={title}
      description={
        description || meta ? (
          <div className="space-y-1">
            {description ? <div>{description}</div> : null}
            {meta ? <p className="sms-text-caption">{meta}</p> : null}
          </div>
        ) : undefined
      }
      filters={filters}
      actions={actions}
      mobileActions={mobileActions}
      footer={footer}
      width={width}
      className={sfCn("sms-module-layout", className)}
    >
      {controls ? (
        <SmsSection title="Controls">
          <div className="sms-module-controls">{controls}</div>
        </SmsSection>
      ) : null}

      {stats && stats.length > 0 ? (
        <SmsSection title="Overview">
          <div className="sms-grid sms-grid-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <SmsCard
                  key={stat.id}
                  padding="md"
                  className={sfCn(
                    "sms-stat-card border-l-[3px]",
                    STAT_TONE[stat.tone ?? "default"],
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="sms-text-label">{stat.label}</p>
                    {Icon ? (
                      <Icon
                        className="h-4 w-4 shrink-0 text-[var(--sms-secondary)]"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="sms-stat-value mt-2">{stat.value}</p>
                  {stat.hint ? (
                    <p className="sms-text-caption mt-1">{stat.hint}</p>
                  ) : null}
                </SmsCard>
              );
            })}
          </div>
        </SmsSection>
      ) : null}

      {children}

      {sections?.map((section) => {
        const Icon = section.icon;
        const header = (
          <SmsSectionHeader
            title={section.title}
            description={section.description}
            icon={Icon}
            actions={section.actions}
          />
        );
        if (section.card === false) {
          return (
            <div key={section.id} className="space-y-[var(--sms-space-4)]">
              {header}
              {section.children}
            </div>
          );
        }
        return (
          <SmsCard key={section.id} padding="lg" className="sms-module-section-card">
            {header}
            <div className="mt-[var(--sms-space-4)]">{section.children}</div>
          </SmsCard>
        );
      })}
    </SmsPageLayout>
  );
}

export function SmsSectionHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={sfCn(
        "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="sms-section-icon" aria-hidden>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h2 className="sms-text-h2">{title}</h2>
          {description ? (
            <p className="sms-text-body-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
