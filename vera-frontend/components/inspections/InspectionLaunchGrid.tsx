"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Eye,
  HardHat,
  ListChecks,
  Shield,
  Target,
  Wrench,
} from "lucide-react";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type InspectionLaunchLinks = {
  smartSite: string;
  focusAudits: string;
  equipment: string;
  equipmentSafety?: string;
  ppe: string;
  /** Site-level PPE spot check (secondary) */
  ppeSpotCheck?: string;
  safetyDevices: string;
  bboNew: string;
  newInspection: string;
};

type LaunchCardProps = {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: ReactNode;
  accent: string;
  featured?: boolean;
  secondaryHref?: string;
  secondaryLabel?: string;
};

function LaunchCard({
  href,
  title,
  description,
  cta,
  icon,
  accent,
  featured,
  secondaryHref,
  secondaryLabel,
}: LaunchCardProps) {
  return (
    <article
      className={`vs-panel flex flex-col p-4 ${featured ? "md:col-span-2 lg:col-span-1" : ""}`}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold" style={{ color: VS_COLORS.navy }}>
        {title}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed" style={{ color: VS_COLORS.muted }}>
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold"
          style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
        >
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="text-center text-[11px] font-medium hover:underline"
            style={{ color: VS_COLORS.blue }}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

/** First-class start options for Smart Site, Focus Audits, Equipment, PPE, Safety devices, BBO. */
export function InspectionLaunchGrid({ links }: { links: InspectionLaunchLinks }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <LaunchCard
        featured
        href={links.smartSite}
        title="Smart Site Inspection"
        description="AI-powered walkdown — capture photos for vision analysis, numbered findings, and CAPA assignment."
        cta="Open smart site"
        icon={<Camera className="h-5 w-5" />}
        accent={VS_COLORS.emerald}
      />
      <LaunchCard
        href={links.focusAudits}
        title="Focus Audits"
        description="Photo-assisted AI audits for fall protection, LOTO, machine guarding, and 30+ high-risk programs."
        cta="Browse focus audits"
        icon={<Target className="h-5 w-5" />}
        accent={VS_COLORS.orange}
      />
      <LaunchCard
        href={links.equipment}
        title="Equipment inspections"
        description="PME, aerial lifts, forklifts, cranes, and power tools — pre-use and daily checklists."
        cta="Start equipment checklist"
        secondaryHref={links.equipmentSafety}
        secondaryLabel="PM equipment safety →"
        icon={<Wrench className="h-5 w-5" />}
        accent={VS_COLORS.blue}
      />
      <LaunchCard
        href={links.ppe}
        title="PPE pre-use"
        description="Worker kit inspection — hard hat through harness. Failures removed from service; company and project management can review."
        cta="Start PPE pre-use"
        secondaryHref={links.ppeSpotCheck}
        secondaryLabel={links.ppeSpotCheck ? "Site PPE spot check →" : undefined}
        icon={<HardHat className="h-5 w-5" />}
        accent={VS_COLORS.blue}
      />
      <LaunchCard
        href={links.safetyDevices}
        title="Safety devices"
        description="Guards, interlocks, E-stops, extinguishers, eyewash, alarms, and other engineered controls."
        cta="Start safety devices"
        icon={<Shield className="h-5 w-5" />}
        accent={VS_COLORS.emerald}
      />
      <LaunchCard
        href={links.bboNew}
        title="BBO observations"
        description="ABC behaviour observations — category, antecedents, on-the-spot coaching, and one owned follow-up linked to Action Management."
        cta="New BBO"
        icon={<Eye className="h-5 w-5" />}
        accent={VS_COLORS.orange}
      />
      <LaunchCard
        href={links.newInspection}
        title="All checklists"
        description="Full library — site, construction, environmental, emergency, and custom published templates."
        cta="Browse all checklists"
        icon={<ListChecks className="h-5 w-5" />}
        accent={VS_COLORS.muted}
      />
    </div>
  );
}
