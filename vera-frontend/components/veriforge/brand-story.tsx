"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { VeriForgeLogo, VeriForgeMark } from "./logo";
import { VeriForgeButton, VeriForgeCTA } from "./button";
import {
  veriforgeTypography,
  VeriForgeDivider,
  VeriForgeSectionHeader,
} from "./theme";
import { vfSurface } from "./surfaces";
import {
  AuditIcon,
  ComplianceIcon,
  VerificationIcon,
} from "./icons";
import {
  VeriForgeBrandIdentityPanel,
  VeriForgeImageryPanel,
  VeriForgeLogoUsageStrip,
  VeriForgeVisualLanguagePanel,
} from "./brand-identity";

export const VERIFORGE_BRAND_STORY = {
  belief:
    "VeriForge was built on the belief that safety should be verified, not assumed.",
  context:
    "In environments of rising operational risk and fragmented tools, VeriForge provides a structured compliance platform that unifies training, verification, inspection, and incident control.",
  craft:
    "Every workflow, module, and checkpoint is designed for clarity, auditability, and industrial discipline — inspired by inspection tags, safety signage, and ISO iconography.",
  foundation:
    "VeriForge is not consumer software — it is an enterprise safety compliance system built for trust.",
} as const;

export const VERIFORGE_MANIFESTO: readonly string[] = [
  "Safety is non-negotiable — it must be verified.",
  "Verification must be structured, measurable, and repeatable.",
  "Compliance must be clear, auditable, and reliable.",
  "Training must be modern, accountable, and evidence-based.",
  "Incidents must be captured, investigated, and closed with discipline.",
  "Workflows must be intentional, aligned, and built to last.",
  "Data must be protected with enterprise-grade controls.",
  "Every user deserves tools designed for operational reliability.",
  "Every organization deserves a platform built for compliance trust.",
  "VeriForge exists to raise the standard of industrial safety.",
] as const;

export const VERIFORGE_BRAND_PILLARS = [
  {
    id: "verification",
    title: "Verification",
    line: "Inspection-grade checks. Evidence trails. No ambiguity.",
    icon: VerificationIcon,
  },
  {
    id: "compliance",
    title: "Compliance",
    line: "Structured controls. Audit-ready records. Controlled accents.",
    icon: ComplianceIcon,
  },
  {
    id: "trust",
    title: "Trust",
    line: "Calm authority across training, field ops, and executive reporting.",
    icon: AuditIcon,
  },
] as const;

export function VeriForgeBrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid h-24 w-24 place-items-center rounded-[3px] border border-[#5A6169] bg-[#2A2E33] shadow-none",
        className,
      )}
    >
      <VeriForgeMark size={72} />
    </div>
  );
}

export function VeriForgeBrandStoryHero() {
  return (
    <section
      className={cn(
        vfSurface.panel,
        "relative overflow-hidden px-6 py-14 md:px-10 md:py-20",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(30,111,184,.10),transparent_42%),radial-gradient(circle_at_82%_72%,rgba(47,143,140,.08),transparent_46%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[#1E6FB8]"
      />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <VeriForgeBrandMark className="mb-8" />
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2F8F8C]">
          Brand identity
        </p>
        <h1
          className={cn(
            veriforgeTypography.heading,
            "text-3xl font-semibold tracking-tight text-[#F4F6F8] md:text-5xl",
          )}
        >
          Verified for absolute safety
        </h1>
        <div className="mt-5 h-0.5 w-40 bg-[#1E6FB8]" />
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D5DBE0] md:text-lg">
          {VERIFORGE_BRAND_STORY.belief}
        </p>
      </div>
    </section>
  );
}

export function VeriForgeBrandStoryNarrative() {
  const blocks = [
    { title: "Belief", body: VERIFORGE_BRAND_STORY.belief },
    { title: "Context", body: VERIFORGE_BRAND_STORY.context },
    { title: "Craft", body: VERIFORGE_BRAND_STORY.craft },
    { title: "Foundation", body: VERIFORGE_BRAND_STORY.foundation },
  ];

  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Platform narrative"
        description="Professional safety compliance — structured, calm, authoritative."
        eyebrow="Brand story"
        icon={<ComplianceIcon size={16} tone="active" />}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {blocks.map((block) => (
          <article key={block.title} className={cn(vfSurface.inset, "p-4")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
              {block.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#D5DBE0]">
              {block.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function VeriForgeBrandPillars() {
  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Brand pillars"
        description="Verification, compliance, and trust — the operating principles of VeriForge."
        eyebrow="Identity system"
        icon={<AuditIcon size={16} tone="active" />}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {VERIFORGE_BRAND_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article key={pillar.id} className={cn(vfSurface.elevated, "p-4")}>
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-[3px] border border-[#5A6169] bg-[#23272C] text-[#1E6FB8]">
                <Icon size={18} tone="active" />
              </div>
              <h3
                className={cn(
                  veriforgeTypography.heading,
                  "text-sm font-semibold text-[#F4F6F8]",
                )}
              >
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#B8C0C8]">
                {pillar.line}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function VeriForgeManifestoPanel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const lines = compact ? VERIFORGE_MANIFESTO.slice(0, 5) : VERIFORGE_MANIFESTO;

  return (
    <section className={cn(vfSurface.panel, "p-5", className)}>
      <VeriForgeSectionHeader
        title="Safety manifesto"
        description="Operating commitments for a compliant industrial platform."
        eyebrow="Principles"
        icon={<VerificationIcon size={16} tone="active" />}
        actions={
          compact ? (
            <Link href="/veriforge/brand">
              <VeriForgeButton variant="secondary" size="sm">
                Full manifesto
              </VeriForgeButton>
            </Link>
          ) : null
        }
      />
      <ol className="space-y-2">
        {lines.map((line, index) => (
          <li
            key={line}
            className="flex gap-3 border-b border-[#5A6169]/50 py-2 text-sm text-[#D5DBE0] last:border-0"
          >
            <span className="w-6 shrink-0 tabular-nums text-[#1E6FB8]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VeriForgeVisualIdentityStrip() {
  const tokens = [
    { label: "Deep Slate", value: "#2A2E33", swatch: "#2A2E33" },
    { label: "Graphite", value: "#3B3F45", swatch: "#3B3F45" },
    { label: "Safety Blue", value: "#1E6FB8", swatch: "#1E6FB8" },
    { label: "Inspection Teal", value: "#2F8F8C", swatch: "#2F8F8C" },
    { label: "Muted Amber", value: "#C89F3D", swatch: "#C89F3D" },
    { label: "Soft Green", value: "#4FAF6F", swatch: "#4FAF6F" },
  ];

  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Visual identity"
        description="Muted industrial palette with controlled accents. No aggressive reds or black-heavy motifs."
        eyebrow="System"
        icon={<ComplianceIcon size={16} tone="active" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token) => (
          <div key={token.label} className={cn(vfSurface.inset, "p-3")}>
            <div
              className="mb-3 h-14 rounded-[3px] border border-[#5A6169]"
              style={{ background: token.swatch }}
            />
            <p
              className={cn(
                veriforgeTypography.heading,
                "text-[12px] font-semibold text-[#F4F6F8]",
              )}
            >
              {token.label}
            </p>
            <p className="mt-1 text-xs tabular-nums text-[#A8B0B8]">
              {token.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          "Geometric forms inspired by inspection tags and ISO signage",
          "Clean line icons — no consumer illustration styles",
          "Inter / Roboto typography · medium weight · high legibility",
        ].map((rule) => (
          <div
            key={rule}
            className={cn(vfSurface.elevated, "px-4 py-3 text-sm text-[#D5DBE0]")}
          >
            {rule}
          </div>
        ))}
      </div>
    </section>
  );
}

export function VeriForgeBrandStoryPage() {
  return (
    <div className="space-y-6">
      <VeriForgeBrandStoryHero />
      <VeriForgeBrandIdentityPanel />
      <VeriForgeVisualLanguagePanel />
      <VeriForgeLogoUsageStrip />
      <VeriForgeImageryPanel />
      <VeriForgeBrandStoryNarrative />
      <VeriForgeBrandPillars />
      <VeriForgeManifestoPanel />
      <VeriForgeVisualIdentityStrip />

      <VeriForgeDivider />

      <div className={cn(vfSurface.panel, "p-5")}>
        <div className="mb-4 flex items-center gap-3">
          <VeriForgeLogo />
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#A8B0B8]">
            Marketing · Sales · Product
          </p>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-[#D5DBE0]">
          Carry this identity across every surface — same verification language,
          same muted palette, same industrial clarity from executive dashboards
          to field mobile. No aggressive reds. No consumer illustration styles.
        </p>
      </div>

      <VeriForgeCTA
        kicker="Deploy the identity"
        title="Raise the standard of industrial safety"
        description="Activate VeriForge across training, verification, compliance, and incident command with one professional brand system."
        actionLabel="Open platform"
      />
    </div>
  );
}

export function VeriForgeBrandStoryTeaser() {
  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            Brand story
          </p>
          <h2
            className={cn(
              veriforgeTypography.heading,
              "mt-2 text-xl font-semibold text-[#F4F6F8]",
            )}
          >
            Safety verified. Not assumed.
          </h2>
          <div className="mt-3 h-0.5 w-28 bg-[#1E6FB8]" />
          <p className="mt-4 text-sm leading-relaxed text-[#D5DBE0]">
            {VERIFORGE_BRAND_STORY.foundation}
          </p>
        </div>
        <Link href="/veriforge/brand">
          <VeriForgeButton variant="secondary">
            Read story & manifesto
          </VeriForgeButton>
        </Link>
      </div>
    </section>
  );
}
