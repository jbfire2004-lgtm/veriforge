"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import { SmsPageLayout } from "./SmsPageLayout";
import { SmsCard } from "./SmsCard";
import { SmsSection } from "./SmsSection";
import {
  SmsSectionHeader,
  type SmsModuleStat,
} from "./SmsModuleLayout";

export type SmsUniversalSummaryCard = SmsModuleStat;

export type SmsUniversalHeader = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
};

export type SmsUniversalLayoutProps = {
  /** Page header — brand/eyebrow, title, supporting copy */
  header: SmsUniversalHeader;
  /** KPI / summary cards row (SMS Overview band) */
  summaryCards?: SmsUniversalSummaryCard[];
  /** Primary + secondary actions (header toolbar + optional sticky bar) */
  actions?: ReactNode;
  /** Mobile-only action strip; defaults to `actions` */
  mobileActions?: ReactNode;
  /** Optional filter / control strip under the header */
  filters?: ReactNode;
  /** Main content area */
  children?: ReactNode;
  /** Page footer — links, status, legal */
  footer?: ReactNode;
  /** Optional titled blocks inside the main area */
  sections?: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: ReactNode;
    children: ReactNode;
    card?: boolean;
  }>;
  width?: "default" | "narrow" | "full";
  className?: string;
  /** Optional label above summary cards */
  summaryLabel?: string;
  /** Optional label wrapper for the main content region */
  mainLabel?: string;
};

const STAT_TONE: Record<
  NonNullable<SmsUniversalSummaryCard["tone"]>,
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
 * Universal layout template based on SMS Core.
 *
 * Regions (locked order):
 * 1. Header — eyebrow, title, description / meta, action buttons
 * 2. Summary cards — KPI / overview strip
 * 3. Main content — children + optional titled sections
 * 4. Action buttons — also surfaced in the header (and mobile bar)
 * 5. Footer — caption / secondary links
 *
 * Prefer this over ad-hoc page shells. `SmsModuleLayout` remains as a
 * compatible alias for older call sites.
 */
export function SmsUniversalLayout({
  header,
  summaryCards,
  actions,
  mobileActions,
  filters,
  children,
  footer,
  sections,
  width = "default",
  className,
  summaryLabel = "Summary",
  mainLabel,
}: SmsUniversalLayoutProps) {
  const { eyebrow, title, description, meta } = header;

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
      className={sfCn("sms-universal-layout sms-module-layout vera-shell", className)}
    >
      {/* ── Summary cards ─────────────────────────────────────────── */}
      {summaryCards && summaryCards.length > 0 ? (
        <SmsSection title={summaryLabel}>
          <div
            className="sms-grid sms-grid-3"
            data-region="summary-cards"
            role="region"
            aria-label={summaryLabel}
          >
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <SmsCard
                  key={card.id}
                  padding="md"
                  className={sfCn(
                    "sms-stat-card border-l-[3px]",
                    STAT_TONE[card.tone ?? "default"],
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="sms-text-label">{card.label}</p>
                    {Icon ? (
                      <Icon
                        className="h-4 w-4 shrink-0 text-[var(--sms-secondary)]"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="sms-stat-value mt-2">{card.value}</p>
                  {card.hint ? (
                    <p className="sms-text-caption mt-1">{card.hint}</p>
                  ) : null}
                </SmsCard>
              );
            })}
          </div>
        </SmsSection>
      ) : null}

      {/* ── Main content ──────────────────────────────────────────── */}
      <div
        data-region="main-content"
        className="space-y-[var(--sms-space-6)]"
        role="region"
        aria-label={mainLabel ?? "Main content"}
      >
        {mainLabel && (children || (sections && sections.length > 0)) ? (
          <p className="sms-text-label">{mainLabel}</p>
        ) : null}

        {children}

        {sections?.map((section) => {
          const Icon = section.icon;
          const blockHeader = (
            <SmsSectionHeader
              title={section.title}
              description={section.description}
              icon={Icon}
              actions={section.actions}
            />
          );
          if (section.card === false) {
            return (
              <div
                key={section.id}
                className="space-y-[var(--sms-space-4)]"
              >
                {blockHeader}
                {section.children}
              </div>
            );
          }
          return (
            <SmsCard
              key={section.id}
              padding="lg"
              className="sms-module-section-card"
            >
              {blockHeader}
              <div className="mt-[var(--sms-space-4)]">{section.children}</div>
            </SmsCard>
          );
        })}
      </div>
    </SmsPageLayout>
  );
}

/** Back-compat: module layout props → universal template */
export function smsModulePropsToUniversal(props: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  filters?: ReactNode;
  controls?: ReactNode;
  stats?: SmsModuleStat[];
  sections?: SmsUniversalLayoutProps["sections"];
  children?: ReactNode;
  footer?: ReactNode;
  width?: SmsUniversalLayoutProps["width"];
  className?: string;
}): SmsUniversalLayoutProps {
  return {
    header: {
      eyebrow: props.eyebrow,
      title: props.title,
      description: props.description,
      meta: props.meta,
    },
    summaryCards: props.stats,
    actions: props.actions,
    mobileActions: props.mobileActions,
    filters: props.filters ?? props.controls,
    children: props.children,
    footer: props.footer,
    sections: props.sections,
    width: props.width,
    className: props.className,
  };
}
