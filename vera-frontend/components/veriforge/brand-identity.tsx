"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { VeriForgeLogo, VeriForgeLogoStacked, VeriForgeMark } from "./logo";
import {
  veriforgeTypography,
  VeriForgeSectionHeader,
} from "./theme";
import { vfSurface } from "./surfaces";
import {
  VERIFORGE_IMAGERY_RULES,
  VERIFORGE_LOGO_DIRECTION,
  VERIFORGE_VISUAL_LANGUAGE,
  VERIFORGE_BRAND_POSITIONING,
} from "./brand-identity-spec";
import { ComplianceIcon, VerificationIcon } from "./icons";

/** Minimalist ISO-style diagram — verification workflow (line only). */
export function VeriForgeVerificationDiagram({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 96"
      className={cn("h-auto w-full text-[#5A6169]", className)}
      role="img"
      aria-label="Verification workflow diagram"
    >
      <title>Evidence → Inspect → Verify → Record</title>
      {[
        { x: 24, label: "Evidence" },
        { x: 104, label: "Inspect" },
        { x: 184, label: "Verify" },
        { x: 264, label: "Record" },
      ].map((node, i) => (
        <g key={node.label}>
          <rect
            x={node.x}
            y="28"
            width="40"
            height="40"
            rx="3"
            fill="#2A2E33"
            stroke={i === 2 ? "#1E6FB8" : "#5A6169"}
            strokeWidth="1.25"
          />
          {i === 2 ? (
            <path
              d="M116 50 124 58 140 42"
              fill="none"
              stroke="#2F8F8C"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`translate(${node.x - 104},0)`}
            />
          ) : (
            <circle
              cx={node.x + 20}
              cy="48"
              r="4"
              fill="none"
              stroke="#8A9199"
              strokeWidth="1.2"
            />
          )}
          <text
            x={node.x + 20}
            y="86"
            textAnchor="middle"
            fill="#A8B0B8"
            fontSize="9"
            fontFamily="Inter, Roboto, sans-serif"
            letterSpacing="0.06em"
          >
            {node.label.toUpperCase()}
          </text>
          {i < 3 ? (
            <path
              d={`M${node.x + 44} 48 H${node.x + 76}`}
              stroke="#5A6169"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/** Inspection-tag motif diagram — brand geometry explained. */
export function VeriForgeInspectionTagDiagram({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={cn("h-auto w-full max-w-xs", className)}
      role="img"
      aria-label="Inspection tag brand geometry"
    >
      <title>Inspection tag geometry</title>
      <path
        d="M24 20h110L156 42v78c0 4.4-3.6 8-8 8H32c-4.4 0-8-3.6-8-8V28c0-4.4 3.6-8 8-8Z"
        fill="#2A2E33"
        stroke="#5A6169"
        strokeWidth="1.25"
      />
      <rect
        x="44"
        y="48"
        width="84"
        height="58"
        rx="3"
        fill="none"
        stroke="#1E6FB8"
        strokeWidth="1.5"
      />
      <path
        d="M62 80 78 94 112 62"
        fill="none"
        stroke="#2F8F8C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="142" cy="32" r="6" fill="#1C1F24" stroke="#5A6169" strokeWidth="1" />
      <text x="24" y="128" fill="#8A9199" fontSize="8" fontFamily="Inter, Roboto, sans-serif">
        PLATE · FRAME · CHECK · REGISTRATION
      </text>
    </svg>
  );
}

export function VeriForgeBrandIdentityPanel() {
  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Brand identity"
        description={VERIFORGE_BRAND_POSITIONING.category}
        eyebrow="VeriForge"
        icon={<VerificationIcon size={16} tone="active" />}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className={cn(vfSurface.inset, "flex flex-col items-center gap-4 p-5")}>
          <VeriForgeLogoStacked markSize={64} />
          <div className="flex items-center gap-3">
            <VeriForgeMark size={28} />
            <VeriForgeMark size={28} variant="outline" className="text-[#F4F6F8]" />
            <VeriForgeMark size={28} variant="mono" className="text-[#D5DBE0]" />
          </div>
          <p className="text-center text-[10px] uppercase tracking-[0.1em] text-[#8A9199]">
            Default · Outline · Mono
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-[#D5DBE0]">
            {VERIFORGE_LOGO_DIRECTION.concept}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {VERIFORGE_LOGO_DIRECTION.meaning.map((line) => (
              <li
                key={line}
                className={cn(vfSurface.elevated, "px-3 py-2.5 text-xs leading-relaxed text-[#C5CCD3]")}
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#8A9199]">{VERIFORGE_LOGO_DIRECTION.clearSpace}</p>
        </div>
      </div>
    </section>
  );
}

export function VeriForgeVisualLanguagePanel() {
  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Visual language"
        description={VERIFORGE_VISUAL_LANGUAGE.tone}
        eyebrow="System"
        icon={<ComplianceIcon size={16} tone="active" />}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className={cn(vfSurface.inset, "p-4")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            Inspired by
          </p>
          <ul className="mt-3 space-y-2">
            {VERIFORGE_VISUAL_LANGUAGE.inspiration.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[#D5DBE0]">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#1E6FB8]" />
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className={cn(vfSurface.inset, "p-4")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C89F3D]">
            Avoid
          </p>
          <ul className="mt-3 space-y-2">
            {VERIFORGE_VISUAL_LANGUAGE.avoid.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[#D5DBE0]">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#5A6169]" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(VERIFORGE_VISUAL_LANGUAGE.palette).map(([key, value]) => (
          <div key={key} className={cn(vfSurface.elevated, "p-3")}>
            <p
              className={cn(
                veriforgeTypography.heading,
                "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A8B0B8]",
              )}
            >
              {key}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#D5DBE0]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VeriForgeImageryPanel() {
  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Imagery & diagrams"
        description="Clean line icons and minimalist compliance diagrams — never playful illustration."
        eyebrow="Visual assets"
        icon={<VerificationIcon size={16} tone="active" />}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={cn(vfSurface.inset, "p-4")}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            Verification workflow
          </p>
          <VeriForgeVerificationDiagram />
        </div>
        <div className={cn(vfSurface.inset, "flex flex-col items-center p-4")}>
          <p className="mb-3 self-start text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            Inspection tag motif
          </p>
          <VeriForgeInspectionTagDiagram />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className={cn(vfSurface.elevated, "p-4")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#4FAF6F]">
            Prefer
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#D5DBE0]">
            {VERIFORGE_IMAGERY_RULES.prefer.map((rule) => (
              <li key={rule}>· {rule}</li>
            ))}
          </ul>
        </article>
        <article className={cn(vfSurface.elevated, "p-4")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C89F3D]">
            Do not use
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#D5DBE0]">
            {VERIFORGE_IMAGERY_RULES.forbid.map((rule) => (
              <li key={rule}>· {rule}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export function VeriForgeLogoUsageStrip() {
  return (
    <section className={cn(vfSurface.panel, "p-5")}>
      <VeriForgeSectionHeader
        title="Logo lockups"
        description="Use the mark with clear space. Prefer default on slate; outline/mono for diagrams and print."
        eyebrow="Usage"
        icon={<VeriForgeMark size={16} />}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className={cn(vfSurface.inset, "flex items-center justify-center p-6")}>
          <VeriForgeLogo markSize={36} />
        </div>
        <div className={cn(vfSurface.inset, "flex items-center justify-center bg-[#F4F6F8] p-6")}>
          <div className="inline-flex items-center gap-2.5">
            <VeriForgeMark size={36} variant="mono" className="text-[#2A2E33]" />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-[0.04em] text-[#2A2E33]">
                VeriForge
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#2F8F8C]">
                Safety compliance
              </span>
            </span>
          </div>
        </div>
        <div className={cn(vfSurface.inset, "flex items-center justify-center p-6")}>
          <VeriForgeLogo compact markSize={40} />
        </div>
      </div>
    </section>
  );
}
