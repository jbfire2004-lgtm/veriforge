"use client";

import * as React from "react";
import Link from "next/link";
import {
  VeriForgeButton,
  VeriForgeCodeBlock,
  VeriForgeDocSection,
  VeriForgeDocSteps,
  VeriForgeProgressBar,
} from "@/components/veriforge";

const APPLY_STAGES = [
  "Application",
  "Review",
  "Approval",
  "Onboarding",
  "Portal Access",
];

const BENEFITS = [
  "API access",
  "Co-branded materials",
  "Training modules",
  "Compliance alignment",
  "Joint marketing campaigns",
];

export function PartnerTierCardsWidget() {
  return (
    <VeriForgeDocSection title="Tier Cards">
      <div className="grid gap-3 lg:grid-cols-3">
        <article className="border border-[var(--vf-color-forge-red)] bg-[#2a2a2a] p-4">
          <h3 className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#fafafa]">
            Forge Partner
          </h3>
          <p className="mt-2 text-sm text-[#d4d4d4]">Basic integrations and training access.</p>
          <VeriForgeButton variant="secondary" className="mt-3 w-full">
            Start Forge Tier
          </VeriForgeButton>
        </article>

        <article className="border border-[var(--vf-color-steel-grey)] bg-[linear-gradient(145deg,#1d1d1d_0%,#141414_100%)] p-4">
          <h3 className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#fafafa]">
            Alloy Partner
          </h3>
          <p className="mt-2 text-sm text-[#d4d4d4]">Advanced integrations and co-marketing lanes.</p>
          <VeriForgeButton className="mt-3 w-full">Advance to Alloy</VeriForgeButton>
        </article>

        <article className="border border-[var(--vf-color-forge-red)] bg-[linear-gradient(145deg,#1a1a1a_0%,#101010_100%)] p-4 shadow-[0_0_0_1px_rgba(198,40,40,.4),0_0_24px_rgba(198,40,40,.35)]">
          <h3 className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.12em] text-[#fafafa]">
            Apex Partner
          </h3>
          <p className="mt-2 text-sm text-[#ffd0d0]">Full workflow integration and dedicated support.</p>
          <VeriForgeButton className="mt-3 w-full" size="lg">
            Reach Apex
          </VeriForgeButton>
        </article>
      </div>
    </VeriForgeDocSection>
  );
}

export function PartnerBenefitsWidget() {
  return (
    <VeriForgeDocSection title="Benefit Matrix">
      <div className="grid gap-2 md:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit}
            className="flex items-center gap-2 border border-[var(--vf-color-steel-grey)] bg-[#1f1f1f] px-3 py-2 text-sm text-[#d8d8d8]"
          >
            <span className="h-1.5 w-1.5 bg-[var(--vf-color-forge-red)] shadow-[var(--vf-effect-glow-primary)]" />
            {benefit}
          </div>
        ))}
      </div>
    </VeriForgeDocSection>
  );
}

export function PartnerApplyWidget() {
  const [company, setCompany] = React.useState("");
  const [focus, setFocus] = React.useState("");
  const [tier, setTier] = React.useState("Forge Partner");

  const complianceReady = React.useMemo(() => {
    const value = `${company} ${focus}`.toLowerCase();
    return value.includes("compliance") || value.includes("verification") || value.includes("training");
  }, [company, focus]);

  return (
    <VeriForgeDocSection title="Application Workflow">
      <div className="space-y-3">
        <div className="grid gap-2 md:grid-cols-5">
          {APPLY_STAGES.map((step) => (
            <div
              key={step}
              className="border border-[var(--vf-color-steel-grey)] bg-[#1f1f1f] px-2 py-2 text-center text-[10px] uppercase tracking-[0.12em] text-[#d2d2d2]"
            >
              {step}
            </div>
          ))}
        </div>

        <input
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Partner company name"
          className="h-11 w-full border border-[var(--vf-color-steel-grey)] bg-[#181818] px-3 text-sm text-[#fafafa] outline-none focus:border-[var(--vf-color-forge-red)] focus:shadow-[var(--vf-effect-glow-primary)]"
        />
        <input
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          placeholder="Integration focus (training / verification / compliance)"
          className="h-11 w-full border border-[var(--vf-color-steel-grey)] bg-[#181818] px-3 text-sm text-[#fafafa] outline-none focus:border-[var(--vf-color-forge-red)] focus:shadow-[var(--vf-effect-glow-primary)]"
        />
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value)}
          className="h-11 w-full border border-[var(--vf-color-steel-grey)] bg-[#181818] px-3 text-sm text-[#fafafa] outline-none focus:border-[var(--vf-color-forge-red)] focus:shadow-[var(--vf-effect-glow-primary)]"
        >
          <option>Forge Partner</option>
          <option>Alloy Partner</option>
          <option>Apex Partner</option>
        </select>

        <div className="border border-[var(--vf-color-steel-grey)] bg-[#1a1a1a] p-3 text-sm text-[#d2d2d2]">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#ffcdcd]">Automated Compliance Verification</p>
          <p className="mt-1">
            Status:{" "}
            <span className={complianceReady ? "text-[#ffbdbd]" : "text-[#aaaaaa]"}>
              {complianceReady ? "Ready for Review" : "Pending Compliance Signals"}
            </span>
          </p>
        </div>

        <VeriForgeButton className="w-full">Submit Partner Application</VeriForgeButton>
      </div>
    </VeriForgeDocSection>
  );
}

export function PartnerResourcesWidget() {
  const resources = [
    "Partner API Integration Guide",
    "Co-Branded Campaign Kit",
    "Compliance Alignment Playbook",
    "Training Enablement Bundle",
  ];

  return (
    <VeriForgeDocSection title="Resource Downloads">
      <div className="grid gap-2 md:grid-cols-2">
        {resources.map((resource) => (
          <div
            key={resource}
            className="flex items-center justify-between border border-[var(--vf-color-steel-grey)] bg-[#202020] px-3 py-2"
          >
            <span className="text-sm text-[#d6d6d6]">{resource}</span>
            <VeriForgeButton size="sm" variant="secondary">
              Download
            </VeriForgeButton>
          </div>
        ))}
      </div>
    </VeriForgeDocSection>
  );
}

export function PartnerPortalWidget() {
  return (
    <>
      <VeriForgeDocSection title="Portal Signals">
        <div className="space-y-3">
          <VeriForgeProgressBar label="Integration Health" value={93} />
          <VeriForgeProgressBar label="Compliance Verification" value={89} />
          <VeriForgeProgressBar label="Campaign Readiness" value={84} />
        </div>
      </VeriForgeDocSection>
      <VeriForgeDocSection title="Portal Actions">
        <VeriForgeDocSteps
          steps={[
            "Monitor integration rail and open support tickets for degraded services.",
            "Review compliance verification output each release cycle.",
            "Activate joint marketing plays from partner resource bundles.",
          ]}
        />
        <div className="mt-3">
          <Link href="/support/overview">
            <VeriForgeButton variant="secondary" className="w-full">
              Open Partner Support Lane
            </VeriForgeButton>
          </Link>
        </div>
      </VeriForgeDocSection>
      <VeriForgeDocSection title="Portal API Example">
        <VeriForgeCodeBlock
          language="json"
          code={`{
  "partnerTier": "Apex",
  "integrationHealth": 93,
  "complianceVerification": "pass",
  "campaignReadiness": "active"
}`}
        />
      </VeriForgeDocSection>
    </>
  );
}

