import * as React from "react";
import { cn } from "@/src/lib/utils";
import {
  VERIFORGE_ICONS,
  type VeriForgeIconCategory,
  type VeriForgeIconTone,
  TrainingIcon,
  VerificationIcon,
  ComplianceIcon,
  IncidentsIcon,
  EquipmentIcon,
  FieldOpsIcon,
  RiskIcon,
  AuditIcon,
  CultureIcon,
  EmergencyIcon,
  ContractorIcon,
} from "@/src/icons/veriforge-icons";

export {
  TrainingIcon,
  VerificationIcon,
  ComplianceIcon,
  IncidentsIcon,
  EquipmentIcon,
  FieldOpsIcon,
  RiskIcon,
  AuditIcon,
  CultureIcon,
  EmergencyIcon,
  ContractorIcon,
  VERIFORGE_ICONS,
};

export type IconTone = "neutral" | "active" | "critical" | "contrast";
export type IconCategory =
  | "training"
  | "verification"
  | "compliance"
  | "incidents"
  | "equipment"
  | "fieldOps"
  | "risk"
  | "audit"
  | "culture"
  | "emergency"
  | "contractor";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  tone?: IconTone;
  /** Show accent corner mark (forced on for active) */
  accent?: boolean;
};

export type IconSpec = {
  id: string;
  name: string;
  category: IconCategory;
  description: string;
  component: string;
  usage: string;
};

const TONE_STROKE: Record<IconTone, string> = {
  neutral: "#5A6169",
  active: "#1E6FB8",
  critical: "#B33A3A",
  contrast: "#F4F6F8",
};

function IconDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-plate`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B3F45" />
        <stop offset="100%" stopColor="#2A2E33" />
      </linearGradient>
    </defs>
  );
}

/** ISO-style line icon shell — clean strokes, muted plate. */
export function IndustrialIcon({
  className,
  size = 24,
  tone = "neutral",
  accent,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  const uid = React.useId().replace(/:/g, "");
  const showAccent = accent ?? tone === "active";
  const stroke = TONE_STROKE[tone];
  const accentStroke = tone === "critical" ? "#B33A3A" : "#2F8F8C";

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("vf-icon shrink-0", className)}
      style={
        {
          "--vf-icon-stroke": stroke,
          "--vf-icon-accent": accentStroke,
        } as React.CSSProperties
      }
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <IconDefs uid={uid} />
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="21"
        rx="2"
        fill={tone === "contrast" ? "#3B3F45" : `url(#${uid}-plate)`}
        stroke="#5A6169"
        strokeWidth={1}
      />
      <g stroke={stroke} strokeWidth={1.6} fill="none">
        {children}
      </g>
      {showAccent ? (
        <path
          d="M4 4h3M4 4v3"
          stroke={accentStroke}
          strokeWidth={1.4}
          fill="none"
          className="vf-icon-accent-mark"
        />
      ) : null}
    </svg>
  );
}

type SimpleIconProps = IconProps;

function BaseIcon({ className, size = 18, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

/* ── Legacy brand marks (compat) — inspection / verification motifs ─────── */

/** Verification stamp — geometric seal (replaces aggressive bolt motif) */
export function ForgeBoltIcon(props: SimpleIconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 12.2 11.2 14.4 15.5 9.5" />
    </BaseIcon>
  );
}

/** Structural trust plate */
export function AnvilIcon(props: SimpleIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 8h12v3H6V8Z" />
      <path d="M8 11v5h8v-5" />
      <path d="M5 16h14" />
      <circle cx="12" cy="6" r="1.2" />
    </BaseIcon>
  );
}

export function ShieldGridIcon(props: SimpleIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5 6v5c0 5.2 3.1 8.6 7 10 3.9-1.4 7-4.8 7-10V6l-7-3Z" />
      <path d="M9 10h6M9 13h6" />
      <path d="M10.5 15.5 12 17l2.5-3" />
    </BaseIcon>
  );
}

export function HeatEdgeIcon(props: SimpleIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 18h12" />
      <path d="M7 14c1-1 1-2 0-3s-1-2 0-3" />
      <path d="M12 14c1-1 1-2 0-3s-1-2 0-3" />
      <path d="M17 14c1-1 1-2 0-3s-1-2 0-3" />
    </BaseIcon>
  );
}

/* ── Training ────────────────────────────────────────────────────────────── */

export function IconTrainingModule(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M3 5h18v14H3z" />
      <path d="M3 9h18M9 5v14" fill="none" />
      <path d="M12 12h6M12 15h4" fill="none" />
    </IndustrialIcon>
  );
}

export function IconTrainingProgress(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 18V6h3v12H4Zm6 0V10h3v8h-3Zm6 0V8h3v10h-3Z" />
      <path d="M3 19h18" fill="none" />
    </IndustrialIcon>
  );
}

export function IconTrainingCertification(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 4 7v5c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V7l-8-4Z" />
      <path d="M9 12l2 2 4-4" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Verification ────────────────────────────────────────────────────────── */

export function IconForgeCheck(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 4h16v16H4z" />
      <path d="M7 12l3.5 3.5L17 9" fill="none" />
    </IndustrialIcon>
  );
}

export function IconForgeStatus(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 20 8v8l-8 5-8-5V8l8-5Z" />
      <path d="M12 8v5M12 16h.01" fill="none" />
    </IndustrialIcon>
  );
}

export function IconWorkflow(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M3 6h6v4H3zM15 6h6v4h-6zM9 14h6v4H9z" />
      <path d="M9 8h6M12 10v4" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Compliance ──────────────────────────────────────────────────────────── */

export function IconComplianceDocument(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M15 3v5h5M9 12h6M9 15h6M9 18h4" fill="none" />
    </IndustrialIcon>
  );
}

export function IconComplianceExpiry(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z" />
      <path d="M12 8v5l3 2" fill="none" />
    </IndustrialIcon>
  );
}

export function IconComplianceRequirement(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" fill="none" />
      <path d="M16 15l2 2 3-4" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Incidents ───────────────────────────────────────────────────────────── */

export function IconIncidentSeverity(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 2 22 20H2L12 2Z" />
      <path d="M12 9v5M12 17h.01" fill="none" />
    </IndustrialIcon>
  );
}

export function IconIncidentInvestigation(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5 20 20" fill="none" />
      <path d="M7 10h6M10 7v6" fill="none" />
    </IndustrialIcon>
  );
}

export function IconCorrectiveAction(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 18 14 8l3 3L7 21H4v-3Z" />
      <path d="M12 6l3-3 4 4-3 3" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Equipment ───────────────────────────────────────────────────────────── */

export function IconEquipmentInspection(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 7h16v12H4z" />
      <path d="M8 7V5h8v2M8 12h8M8 15h5" fill="none" />
    </IndustrialIcon>
  );
}

export function IconEquipmentDefect(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="M8 10l8 8M16 10l-8 8" fill="none" />
    </IndustrialIcon>
  );
}

export function IconEquipmentCertification(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M7 3h10v11l-5 3-5-3V3Z" />
      <path d="M9 9l2 2 4-4" fill="none" />
      <path d="M9 17h6v4H9z" />
    </IndustrialIcon>
  );
}

/* ── Field Ops ───────────────────────────────────────────────────────────── */

export function IconFieldTask(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h2v2H8zM12 8h4M8 13h2v2H8zM12 13h4M8 18h8" fill="none" />
    </IndustrialIcon>
  );
}

export function IconFieldHazard(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 21 19H3L12 3Z" />
      <path d="M12 10v4M12 16.5h.01" fill="none" />
    </IndustrialIcon>
  );
}

export function IconFieldGps(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IndustrialIcon>
  );
}

export function IconFieldCheckIn(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 4h16v16H4z" />
      <path d="M8 12h3l2-4 2 8 2-4h3" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Risk ────────────────────────────────────────────────────────────────── */

export function IconRiskHazard(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 2 22 12 12 22 2 12 12 2Z" />
      <path d="M12 8v5M12 16h.01" fill="none" />
    </IndustrialIcon>
  );
}

export function IconRiskControl(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 4 7v5c0 4.8 3.4 8.2 8 9.5 4.6-1.3 8-4.7 8-9.5V7l-8-4Z" />
      <path d="M8 12h8M12 8v8" fill="none" />
    </IndustrialIcon>
  );
}

export function IconRiskScoring(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 19V5h3v14H4Zm5 0v-8h3v8H9Zm5 0V9h3v10h-3Zm5 0v-5h3v5h-3Z" />
    </IndustrialIcon>
  );
}

/* ── Audit ───────────────────────────────────────────────────────────────── */

export function IconAuditLog(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6M9 11h6M9 15h4" fill="none" />
    </IndustrialIcon>
  );
}

export function IconAuditEvidence(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8v6H8z" />
      <path d="M10 12h4" fill="none" />
    </IndustrialIcon>
  );
}

export function IconAuditScoring(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M3 20 8 8l4 6 3-4 6 10H3Z" />
      <path d="M14 6l2-3 2 3-2 1.5L14 6Z" />
    </IndustrialIcon>
  );
}

/* ── Culture ─────────────────────────────────────────────────────────────── */

export function IconCultureBehavior(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 4 8 10h8L12 4Z" />
      <path d="M7 12h10v8H7z" />
      <path d="M10 15h4" fill="none" />
    </IndustrialIcon>
  );
}

export function IconCultureEngagement(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M8 10a4 4 0 1 1 8 0c0 4-4 7-4 7s-4-3-4-7Z" />
      <path d="M5 20h14" fill="none" />
    </IndustrialIcon>
  );
}

export function IconCultureCampaign(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 5h12l4 4v10H4z" />
      <path d="M8 12h8M8 15h5" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Emergency ───────────────────────────────────────────────────────────── */

export function IconEmergencyAlert(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 21 20H3L12 3Z" />
      <path d="M12 10v4M12 17h.01" fill="none" />
    </IndustrialIcon>
  );
}

export function IconEmergencyEvacuation(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 4h8v16H4z" />
      <path d="M12 8h5l3 4-3 4h-5" fill="none" />
      <path d="M14 12h6" fill="none" />
    </IndustrialIcon>
  );
}

export function IconEmergencyMuster(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z" />
      <path d="M9 12h6M12 9v6" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Contractor ──────────────────────────────────────────────────────────── */

export function IconContractorBadge(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M8 3h8v11l-4 3-4-3V3Z" />
      <path d="M10 8h4M10 11h4" fill="none" />
      <path d="M9 17h6v4H9z" />
    </IndustrialIcon>
  );
}

export function IconContractorOnboarding(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M4 6h16v12H4z" />
      <path d="M8 10h8M8 14h5" fill="none" />
      <path d="M16 13l2 2 3-3" fill="none" />
    </IndustrialIcon>
  );
}

export function IconContractorAccess(props: SimpleIconProps) {
  return (
    <IndustrialIcon {...props}>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" />
      <path d="M5 11h14v10H5z" />
      <path d="M12 15v3" fill="none" />
    </IndustrialIcon>
  );
}

/* ── Catalog registry ────────────────────────────────────────────────────── */

export const VERIFORGE_ICON_CATALOG: IconSpec[] = [
  {
    id: "ico-train-module",
    name: "Training Module",
    category: "training",
    description: "Angular module plate for course units",
    component: "IconTrainingModule",
    usage: "Training lists and module cards",
  },
  {
    id: "ico-train-progress",
    name: "Training Progress",
    category: "training",
    description: "Beveled bar rise for completion",
    component: "IconTrainingProgress",
    usage: "Progress rails and dashboards",
  },
  {
    id: "ico-train-cert",
    name: "Certification",
    category: "training",
    description: "Shield-check for forged credentials",
    component: "IconTrainingCertification",
    usage: "Certificates and pass states",
  },
  {
    id: "ico-ver-check",
    name: "forgeCheck",
    category: "verification",
    description: "Angular check plate for verification",
    component: "IconForgeCheck",
    usage: "forgeCheck actions and results",
  },
  {
    id: "ico-ver-status",
    name: "forgeStatus",
    category: "verification",
    description: "Hex status glyph for forgeStatus",
    component: "IconForgeStatus",
    usage: "Status chips and workflow nodes",
  },
  {
    id: "ico-ver-flow",
    name: "Workflow",
    category: "verification",
    description: "Node connector for forgeFlow",
    component: "IconWorkflow",
    usage: "Workflow builder and rails",
  },
  {
    id: "ico-comp-doc",
    name: "Document",
    category: "compliance",
    description: "Beveled document for compliance files",
    component: "IconComplianceDocument",
    usage: "Document libraries",
  },
  {
    id: "ico-comp-expiry",
    name: "Expiry",
    category: "compliance",
    description: "Hex clock for expiry windows",
    component: "IconComplianceExpiry",
    usage: "Expiry alerts and timelines",
  },
  {
    id: "ico-comp-req",
    name: "Requirement",
    category: "compliance",
    description: "Checklist plate for requirements",
    component: "IconComplianceRequirement",
    usage: "Requirement matrices",
  },
  {
    id: "ico-inc-sev",
    name: "Severity",
    category: "incidents",
    description: "Warning triangle for severity",
    component: "IconIncidentSeverity",
    usage: "Critical incident markers",
  },
  {
    id: "ico-inc-inv",
    name: "Investigation",
    category: "incidents",
    description: "Angular magnifier for investigations",
    component: "IconIncidentInvestigation",
    usage: "Investigation queues",
  },
  {
    id: "ico-inc-ca",
    name: "Corrective Action",
    category: "incidents",
    description: "Forge tool for corrective actions",
    component: "IconCorrectiveAction",
    usage: "CAPA tracking",
  },
  {
    id: "ico-eq-insp",
    name: "Inspection",
    category: "equipment",
    description: "Inspection plate for equipment checks",
    component: "IconEquipmentInspection",
    usage: "Inspection schedules",
  },
  {
    id: "ico-eq-def",
    name: "Defect",
    category: "equipment",
    description: "Crossed plate for defects",
    component: "IconEquipmentDefect",
    usage: "Defect logs",
  },
  {
    id: "ico-eq-cert",
    name: "Equipment Cert",
    category: "equipment",
    description: "Tag cert for equipment clearance",
    component: "IconEquipmentCertification",
    usage: "Equipment certification",
  },
  {
    id: "ico-field-task",
    name: "Field Task",
    category: "fieldOps",
    description: "Checklist for field tasks",
    component: "IconFieldTask",
    usage: "Field task boards",
  },
  {
    id: "ico-field-haz",
    name: "Field Hazard",
    category: "fieldOps",
    description: "Hazard triangle for field risks",
    component: "IconFieldHazard",
    usage: "Hazard reports",
  },
  {
    id: "ico-field-gps",
    name: "GPS",
    category: "fieldOps",
    description: "Angular pin for GPS location",
    component: "IconFieldGps",
    usage: "Location and geofence",
  },
  {
    id: "ico-field-checkin",
    name: "Check-in",
    category: "fieldOps",
    description: "Pulse plate for check-ins",
    component: "IconFieldCheckIn",
    usage: "Muster and check-in",
  },
  {
    id: "ico-risk-haz",
    name: "Risk Hazard",
    category: "risk",
    description: "Diamond hazard for risk matrix",
    component: "IconRiskHazard",
    usage: "Risk registers",
  },
  {
    id: "ico-risk-ctrl",
    name: "Risk Control",
    category: "risk",
    description: "Shield cross for controls",
    component: "IconRiskControl",
    usage: "Control libraries",
  },
  {
    id: "ico-risk-score",
    name: "Risk Scoring",
    category: "risk",
    description: "Bar stack for risk scores",
    component: "IconRiskScoring",
    usage: "Scoring dashboards",
  },
  {
    id: "ico-audit-log",
    name: "Audit Log",
    category: "audit",
    description: "Log plate for audit trails",
    component: "IconAuditLog",
    usage: "Audit logs",
  },
  {
    id: "ico-audit-ev",
    name: "Evidence",
    category: "audit",
    description: "Evidence frame for proof packs",
    component: "IconAuditEvidence",
    usage: "Evidence lockers",
  },
  {
    id: "ico-audit-score",
    name: "Audit Scoring",
    category: "audit",
    description: "Angular chart for audit scores",
    component: "IconAuditScoring",
    usage: "Audit scorecards",
  },
  {
    id: "ico-cult-beh",
    name: "Behavior",
    category: "culture",
    description: "Figure plate for safe behaviors",
    component: "IconCultureBehavior",
    usage: "Behavior observations",
  },
  {
    id: "ico-cult-eng",
    name: "Engagement",
    category: "culture",
    description: "Pin figure for engagement",
    component: "IconCultureEngagement",
    usage: "Engagement metrics",
  },
  {
    id: "ico-cult-camp",
    name: "Campaign",
    category: "culture",
    description: "Banner plate for campaigns",
    component: "IconCultureCampaign",
    usage: "Culture campaigns",
  },
  {
    id: "ico-em-alert",
    name: "Emergency Alert",
    category: "emergency",
    description: "Critical triangle for alerts",
    component: "IconEmergencyAlert",
    usage: "Emergency alerts",
  },
  {
    id: "ico-em-evac",
    name: "Evacuation",
    category: "emergency",
    description: "Exit arrow for evacuation",
    component: "IconEmergencyEvacuation",
    usage: "Evacuation routes",
  },
  {
    id: "ico-em-muster",
    name: "Muster",
    category: "emergency",
    description: "Hex cross for muster points",
    component: "IconEmergencyMuster",
    usage: "Muster tracking",
  },
  {
    id: "ico-ctr-badge",
    name: "Contractor Badge",
    category: "contractor",
    description: "Badge tag for contractor ID",
    component: "IconContractorBadge",
    usage: "Badge issuance",
  },
  {
    id: "ico-ctr-onboard",
    name: "Onboarding",
    category: "contractor",
    description: "Checklist for contractor onboarding",
    component: "IconContractorOnboarding",
    usage: "Onboarding pipelines",
  },
  {
    id: "ico-ctr-access",
    name: "Access",
    category: "contractor",
    description: "Lock plate for site access",
    component: "IconContractorAccess",
    usage: "Access control",
  },
];

export const VERIFORGE_ICON_CATEGORIES: IconCategory[] = [
  "training",
  "verification",
  "compliance",
  "incidents",
  "equipment",
  "fieldOps",
  "risk",
  "audit",
  "culture",
  "emergency",
  "contractor",
];

export const ICON_COMPONENT_MAP: Record<
  string,
  React.ComponentType<SimpleIconProps>
> = {
  IconTrainingModule,
  IconTrainingProgress,
  IconTrainingCertification,
  IconForgeCheck,
  IconForgeStatus,
  IconWorkflow,
  IconComplianceDocument,
  IconComplianceExpiry,
  IconComplianceRequirement,
  IconIncidentSeverity,
  IconIncidentInvestigation,
  IconCorrectiveAction,
  IconEquipmentInspection,
  IconEquipmentDefect,
  IconEquipmentCertification,
  IconFieldTask,
  IconFieldHazard,
  IconFieldGps,
  IconFieldCheckIn,
  IconRiskHazard,
  IconRiskControl,
  IconRiskScoring,
  IconAuditLog,
  IconAuditEvidence,
  IconAuditScoring,
  IconCultureBehavior,
  IconCultureEngagement,
  IconCultureCampaign,
  IconEmergencyAlert,
  IconEmergencyEvacuation,
  IconEmergencyMuster,
  IconContractorBadge,
  IconContractorOnboarding,
  IconContractorAccess,
};

const LEGACY_ID_TO_CATEGORY: Record<string, VeriForgeIconCategory> = {
  "ico-train-module": "training",
  "ico-train-progress": "training",
  "ico-train-cert": "training",
  training: "training",
  "ico-ver-check": "verification",
  "ico-ver-status": "verification",
  "ico-ver-flow": "verification",
  verification: "verification",
  "ico-comp-doc": "compliance",
  "ico-comp-expiry": "compliance",
  "ico-comp-req": "compliance",
  compliance: "compliance",
  "ico-inc-sev": "incidents",
  "ico-inc-inv": "incidents",
  "ico-inc-ca": "incidents",
  incidents: "incidents",
  "ico-eq-insp": "equipment",
  "ico-eq-def": "equipment",
  "ico-eq-cert": "equipment",
  equipment: "equipment",
  "ico-field-task": "fieldOps",
  "ico-field-haz": "fieldOps",
  "ico-field-gps": "fieldOps",
  "ico-field-checkin": "fieldOps",
  fieldOps: "fieldOps",
  "ico-risk-haz": "risk",
  "ico-risk-ctrl": "risk",
  "ico-risk-score": "risk",
  risk: "risk",
  "ico-audit-log": "audit",
  "ico-audit-ev": "audit",
  "ico-audit-score": "audit",
  audit: "audit",
  "ico-cult-beh": "culture",
  "ico-cult-eng": "culture",
  "ico-cult-camp": "culture",
  culture: "culture",
  "ico-em-alert": "emergency",
  "ico-em-evac": "emergency",
  "ico-em-muster": "emergency",
  emergency: "emergency",
  "ico-ctr-badge": "contractor",
  "ico-ctr-onboard": "contractor",
  "ico-ctr-access": "contractor",
  contractor: "contractor",
};

function resolveCategoryFromLegacyId(
  id: string,
): VeriForgeIconCategory | null {
  return LEGACY_ID_TO_CATEGORY[id] ?? null;
}

/** Resolve catalog icon by id with tone — prefers forged-metal category set. */
export function VeriForgeIcon({
  id,
  tone = "neutral",
  size = 24,
  className,
  ...props
}: {
  id: string;
  tone?: IconTone;
  size?: number;
  className?: string;
} & Omit<SimpleIconProps, "tone" | "size">) {
  const category = resolveCategoryFromLegacyId(id);
  if (category) {
    const Comp = VERIFORGE_ICONS[category];
    return (
      <Comp
        tone={tone as VeriForgeIconTone}
        size={size}
        className={className}
        {...props}
      />
    );
  }
  const spec = VERIFORGE_ICON_CATALOG.find((i) => i.id === id);
  if (!spec) return null;
  const Comp = ICON_COMPONENT_MAP[spec.component];
  if (!Comp) return null;
  return <Comp tone={tone} size={size} className={className} {...props} />;
}
