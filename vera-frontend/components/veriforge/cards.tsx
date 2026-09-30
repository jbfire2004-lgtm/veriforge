import * as React from "react";
import { cn } from "@/src/lib/utils";
import {
  veriforgeTypography,
  VeriForgeFrame,
  VeriForgeSectionHeader,
} from "./theme";
import { vfSurface } from "./surfaces";
import {
  ComplianceIcon,
  VerificationIcon,
  AuditIcon,
} from "./icons";

type CardTone = "info" | "feature" | "stat" | "warning" | "success" | "critical";

const toneStyles: Record<CardTone, string> = {
  info: vfSurface.panel,
  feature: vfSurface.elevated,
  stat: vfSurface.panel,
  warning: vfSurface.warning,
  success: vfSurface.success,
  critical: vfSurface.critical,
};

const toneIcon: Record<CardTone, React.ReactNode> = {
  info: <VerificationIcon size={16} tone="active" />,
  feature: <ComplianceIcon size={16} tone="active" />,
  stat: <AuditIcon size={16} tone="active" />,
  warning: <VerificationIcon size={16} tone="active" />,
  success: <ComplianceIcon size={16} tone="active" />,
  critical: <VerificationIcon size={16} tone="critical" />,
};

/**
 * Industrial card — slate/graphite matte surface, ISO header icon, thin border.
 */
export function VeriForgeCard({
  title,
  description,
  tone = "info",
  children,
  className,
  eyebrow,
}: {
  title: string;
  description?: string;
  tone?: CardTone;
  children?: React.ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <VeriForgeFrame
      className={cn("p-4", toneStyles[tone], className)}
      tempered={tone === "warning"}
    >
      <VeriForgeSectionHeader
        title={title}
        description={description}
        eyebrow={eyebrow}
        icon={toneIcon[tone]}
      />
      {children}
    </VeriForgeFrame>
  );
}

export function VeriForgeInfoCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <VeriForgeCard tone="info" title={title}>
      <p className="text-sm leading-relaxed text-[#D5DBE0]">{detail}</p>
    </VeriForgeCard>
  );
}

export function VeriForgeFeatureCard({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <VeriForgeCard tone="feature" title={title} description={summary}>
      <p className="text-sm leading-relaxed text-[#B8C0C8]">
        Structured for field reliability and controlled precision.
      </p>
    </VeriForgeCard>
  );
}

export function VeriForgeStatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <VeriForgeCard tone="stat" title={label}>
      <div className="space-y-1">
        <p
          className={cn(
            veriforgeTypography.heading,
            "text-3xl font-semibold tabular-nums tracking-tight text-[#F4F6F8]",
          )}
        >
          {value}
        </p>
        {delta ? <p className="text-xs text-[#A8B0B8]">{delta}</p> : null}
      </div>
    </VeriForgeCard>
  );
}

export function VeriForgeWarningCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <VeriForgeCard tone="warning" title={title} eyebrow="Caution">
      <p className="text-sm leading-relaxed text-[#F2E8C8]">{message}</p>
    </VeriForgeCard>
  );
}
