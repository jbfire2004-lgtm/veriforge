import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTokens } from "./tokens";
import { vfSurface } from "./surfaces";

export const veriforgePalette = {
  forgeRed: veriforgeTokens.color.forgeRed,
  safetyBlue: veriforgeTokens.color.safetyBlue,
  inspectionTeal: veriforgeTokens.color.inspectionTeal,
  deepSlate: veriforgeTokens.color.deepSlate,
  graphite: veriforgeTokens.color.graphite,
  ironBlack: veriforgeTokens.color.ironBlack,
  steelGrey: veriforgeTokens.color.steelGrey,
  safetyWhite: veriforgeTokens.color.safetyWhite,
  mutedAmber: veriforgeTokens.color.mutedAmber,
  softGreen: veriforgeTokens.color.softGreen,
  criticalAlert: veriforgeTokens.color.criticalAlert,
} as const;

export const veriforgeTypography = {
  heading:
    "font-[var(--vf-font-heading)] tracking-tight font-[var(--vf-heading-weight)] [text-transform:var(--vf-heading-transform)]",
  body:
    "font-[var(--vf-font-body)] font-[var(--vf-body-weight)] [text-transform:var(--vf-body-transform)]",
} as const;

export const veriforgeFx = {
  panel: "bg-[#2A2E33]",
  metal: "bg-[#3B3F45]",
  forge: "bg-[#2A2E33]",
  bevel: "",
  glowRed: "shadow-none",
  glowSteel: "shadow-none",
  glowAccent: "shadow-none",
} as const;

export const veriforgeBase =
  "veriforge-theme relative overflow-hidden rounded-[3px] border border-[#5A6169] bg-[#2A2E33] text-[#F4F6F8] " +
  "shadow-none transition-colors duration-150 ease-out";

export function VeriForgeFrame({
  className,
  children,
  tempered = false,
  elevated = false,
}: {
  className?: string;
  children: React.ReactNode;
  tempered?: boolean;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        veriforgeBase,
        elevated ? vfSurface.elevated : vfSurface.panel,
        tempered && vfSurface.warning,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function VeriForgeDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-px w-full bg-[#5A6169]/70", className)}
    />
  );
}

/** Section header with optional ISO-style icon tile */
export function VeriForgeSectionHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#5A6169]/70 pb-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-[#5A6169] bg-[#23272C] text-[#1E6FB8]">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={cn(
              veriforgeTypography.heading,
              "text-sm font-semibold text-[#F4F6F8]",
              eyebrow && "mt-0.5",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm leading-relaxed text-[#A8B0B8]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
