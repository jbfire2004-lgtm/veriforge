/**
 * VeriForge industrial safety iconography
 * Line-based · steel outlines · safety-blue active · controlled-red critical only
 */

import * as React from "react";
import { COLORS } from "@/src/theme/veriforge-tokens";

export type VeriForgeIconTone = "neutral" | "active" | "critical" | "contrast";

export type VeriForgeIconCategory =
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

export type VeriForgeIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  tone?: VeriForgeIconTone;
  /** Force accent corner mark */
  accent?: boolean;
  title?: string;
};

export type VeriForgeIconSpec = {
  id: VeriForgeIconCategory;
  name: string;
  description: string;
  component: React.ComponentType<VeriForgeIconProps>;
};

const TONE_STROKE: Record<VeriForgeIconTone, string> = {
  neutral: COLORS.steelGrey,
  active: COLORS.safetyBlue,
  critical: COLORS.criticalAlert,
  contrast: COLORS.safetyWhite,
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

/** ISO-style line icon shell — clean strokes, muted plate, no aggressive fills. */
export function IndustrialIconShell({
  className,
  size = 24,
  tone = "neutral",
  accent,
  children,
  title,
  ...props
}: VeriForgeIconProps & { children: React.ReactNode }) {
  const uid = React.useId().replace(/:/g, "");
  const showAccent = accent ?? tone === "active";
  const stroke = TONE_STROKE[tone];
  const accentStroke =
    tone === "critical" ? COLORS.criticalAlert : COLORS.inspectionTeal;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title || props["aria-label"] ? "img" : undefined}
      aria-hidden={title || props["aria-label"] ? undefined : true}
      style={
        {
          ["--vf-icon-stroke" as string]: stroke,
          ["--vf-icon-accent" as string]: accentStroke,
          ...props.style,
        } as React.CSSProperties
      }
      {...props}
    >
      {title ? <title>{title}</title> : null}
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
        />
      ) : null}
    </svg>
  );
}

/* ── Category icons ──────────────────────────────────────────────────────── */

/** Training — angular module plate + progress bar */
export function TrainingIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Training" {...props}>
      <path d="M3 4h18v16H3z" />
      <path d="M3 8h18M8 4v16" fill="none" />
      <path d="M11 12h8M11 15h5" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
    </IndustrialIconShell>
  );
}

/** Verification — forgeCheck plate */
export function VerificationIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Verification" {...props}>
      <path d="M4 4h16v16H4z" />
      <path
        d="M7 12.5 10.5 16 17 8"
        fill="none"
        stroke={COLORS.inspectionTeal}
        strokeWidth={2}
      />
    </IndustrialIconShell>
  );
}

/** Compliance — beveled document */
export function ComplianceIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Compliance" {...props}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M15 3v5h5" fill="none" />
      <path d="M9 12h8M9 15h6M9 18h4" fill="none" />
      <path d="M9 9h3" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
    </IndustrialIconShell>
  );
}

/** Incidents — angular warning triangle */
export function IncidentsIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Incidents" {...props}>
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v5" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={2} />
      <path d="M12 17h.01" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={2.5} />
    </IndustrialIconShell>
  );
}

/** Equipment — angular gear / inspection plate */
export function EquipmentIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Equipment" {...props}>
      <path d="M10 3h4l1 3h3l2 3-2 2v2l2 2-2 3h-3l-1 3h-4l-1-3H6l-2-3 2-2v-2L4 9l2-3h3l1-3Z" />
      <circle cx="12" cy="12" r="3" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.75} />
    </IndustrialIconShell>
  );
}

/** Field Ops — GPS / task diamond */
export function FieldOpsIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Field Operations" {...props}>
      <path d="M12 2 21 12 12 22 3 12 12 2Z" />
      <path d="M12 7v5l3 2" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.75} />
      <circle cx="12" cy="12" r="1.5" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
    </IndustrialIconShell>
  );
}

/** Risk — hazard matrix cell */
export function RiskIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Risk" {...props}>
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" fill="none" />
      <path d="M15 3h6v6h-6z" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
    </IndustrialIconShell>
  );
}

/** Audit — evidence / log plate */
export function AuditIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Audit" {...props}>
      <path d="M5 3h11l3 3v15H5z" />
      <path d="M16 3v3h3" fill="none" />
      <path d="M8 10h8M8 13h8M8 16h5" fill="none" />
      <path d="M8 8h2" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.75} />
    </IndustrialIconShell>
  );
}

/** Culture — people / engagement hex */
export function CultureIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Culture" {...props}>
      <path d="M12 3 19 7v10l-7 4-7-4V7l7-4Z" />
      <circle cx="12" cy="10" r="2.2" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
      <path d="M8 17c1.2-2 2.8-3 4-3s2.8 1 4 3" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
    </IndustrialIconShell>
  );
}

/** Emergency — alert siren plate */
export function EmergencyIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Emergency" {...props}>
      <path d="M8 10h8v8H8z" />
      <path d="M10 10V7a2 2 0 0 1 4 0v3" fill="none" />
      <path d="M6 18h12" />
      <path d="M4 8l2 2M20 8l-2 2M12 3v2" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.75} />
    </IndustrialIconShell>
  );
}

/** Contractor — badge / access plate */
export function ContractorIcon(props: VeriForgeIconProps) {
  return (
    <IndustrialIconShell title="Contractor" {...props}>
      <path d="M5 4h14v16H5z" />
      <path d="M5 9h14" fill="none" />
      <circle cx="12" cy="13.5" r="2.2" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
      <path d="M9 18c.8-1.4 1.9-2 3-2s2.2.6 3 2" fill="none" stroke={COLORS.inspectionTeal} strokeWidth={1.5} />
    </IndustrialIconShell>
  );
}

/* ── Registry ────────────────────────────────────────────────────────────── */

export const VERIFORGE_ICONS = {
  training: TrainingIcon,
  verification: VerificationIcon,
  compliance: ComplianceIcon,
  incidents: IncidentsIcon,
  equipment: EquipmentIcon,
  fieldOps: FieldOpsIcon,
  risk: RiskIcon,
  audit: AuditIcon,
  culture: CultureIcon,
  emergency: EmergencyIcon,
  contractor: ContractorIcon,
} as const satisfies Record<
  VeriForgeIconCategory,
  React.ComponentType<VeriForgeIconProps>
>;

export const VERIFORGE_ICON_SET: VeriForgeIconSpec[] = [
  {
    id: "training",
    name: "Training",
    description: "Angular module plate for courses and certifications",
    component: TrainingIcon,
  },
  {
    id: "verification",
    name: "Verification",
    description: "Verification plate with inspection check",
    component: VerificationIcon,
  },
  {
    id: "compliance",
    name: "Compliance",
    description: "Beveled document with steel outline",
    component: ComplianceIcon,
  },
  {
    id: "incidents",
    name: "Incidents",
    description: "Severity triangle with controlled accent",
    component: IncidentsIcon,
  },
  {
    id: "equipment",
    name: "Equipment",
    description: "Industrial gear for inspections and defects",
    component: EquipmentIcon,
  },
  {
    id: "fieldOps",
    name: "Field Ops",
    description: "Diamond GPS / field task marker",
    component: FieldOpsIcon,
  },
  {
    id: "risk",
    name: "Risk",
    description: "Risk matrix with inspection accent cell",
    component: RiskIcon,
  },
  {
    id: "audit",
    name: "Audit",
    description: "Evidence log plate with teal accent",
    component: AuditIcon,
  },
  {
    id: "culture",
    name: "Culture",
    description: "Hex engagement glyph for safety culture",
    component: CultureIcon,
  },
  {
    id: "emergency",
    name: "Emergency",
    description: "Alert siren plate for emergency response",
    component: EmergencyIcon,
  },
  {
    id: "contractor",
    name: "Contractor",
    description: "Access badge for contractor onboarding",
    component: ContractorIcon,
  },
];

export const VERIFORGE_ICON_CATEGORIES: VeriForgeIconCategory[] =
  VERIFORGE_ICON_SET.map((s) => s.id);

/** Resolve a category icon component */
export function getVeriForgeIcon(
  category: VeriForgeIconCategory,
): React.ComponentType<VeriForgeIconProps> {
  return VERIFORGE_ICONS[category];
}

/** Render helper — ISO-style category icon */
export function VeriForgeCategoryIcon({
  category,
  ...props
}: VeriForgeIconProps & { category: VeriForgeIconCategory }) {
  const Comp = VERIFORGE_ICONS[category];
  return <Comp {...props} />;
}

export {
  TrainingIcon as IconTraining,
  VerificationIcon as IconVerification,
  ComplianceIcon as IconCompliance,
  IncidentsIcon as IconIncidents,
  EquipmentIcon as IconEquipment,
  FieldOpsIcon as IconFieldOps,
  RiskIcon as IconRisk,
  AuditIcon as IconAudit,
  CultureIcon as IconCulture,
  EmergencyIcon as IconEmergency,
  ContractorIcon as IconContractor,
};

export default VERIFORGE_ICONS;
