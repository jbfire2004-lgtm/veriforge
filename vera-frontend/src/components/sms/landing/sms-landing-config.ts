import type { LucideIcon } from "lucide-react";
import {
  Atom,
  ClipboardCheck,
  FileSearch,
  HardHat,
  ListChecks,
  Search,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type { PmWorkflowStep } from "@/lib/navigation/pm-workflow";

/** Top pipeline — ids must match PmWorkflowJourney STEP_VISUALS keys. */
export const SMS_LANDING_WORKFLOW: PmWorkflowStep[] = [
  {
    id: "plan",
    label: "Plan & assess",
    description: "FLHA, JHA, and hazard assessment before work starts.",
    href: "/pm/jha-flha",
  },
  {
    id: "execute",
    label: "Execute in the field",
    description: "Inspections, audits, and safety forms from site.",
    href: "/pm/inspections",
  },
  {
    id: "intelligence",
    label: "Investigate",
    description: "Incidents, observations, and SCL / HECA classification.",
    href: "/pm/incidents",
  },
  {
    id: "close",
    label: "Correct & close",
    description: "Action assignment, verification, and closure.",
    href: "/pm/action-management",
  },
];

export type SmsQuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const SMS_QUICK_ACTIONS: SmsQuickAction[] = [
  {
    id: "flha",
    title: "Start FLHA",
    description: "Field-level hazard assessment for today's work",
    href: "/pm/jha-flha/new/flha",
    icon: HardHat,
  },
  {
    id: "inspection",
    title: "Start Inspection",
    description: "Run a checklist or site walk-through",
    href: "/pm/inspections/new",
    icon: ClipboardCheck,
  },
  {
    id: "audit",
    title: "Start Audit",
    description: "Focused audit or findings log entry",
    href: "/pm/inspections/focus-audits",
    icon: FileSearch,
  },
  {
    id: "capa",
    title: "Start Action",
    description: "Open a new corrective/preventive action from the field",
    href: "/pm/action-management/new",
    icon: ListChecks,
  },
];

export type SmsToolCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const SMS_TOOL_CARDS: SmsToolCard[] = [
  {
    id: "flha-tool",
    title: "FLHA",
    description: "Job and field hazard assessments, crew sign-off, and libraries.",
    href: "/pm/jha-flha",
    icon: HardHat,
  },
  {
    id: "inspections",
    title: "Inspections",
    description: "Templates, execution, deficiencies, and smart workspace.",
    href: "/pm/inspections",
    icon: ClipboardCheck,
  },
  {
    id: "audits",
    title: "Audits",
    description: "Focus audits, findings log, and compliance tracking.",
    href: "/pm/inspections/focus-audits",
    icon: Search,
  },
  {
    id: "capa",
    title: "Action Management",
    description: "Assign, escalate, verify, and close actions across modules.",
    href: "/pm/action-management",
    icon: Wrench,
  },
  {
    id: "investigations",
    title: "Investigations",
    description: "Incidents, near misses, RCA, and investigation reports.",
    href: "/pm/incidents",
    icon: ShieldAlert,
  },
  {
    id: "scl-heca",
    title: "SCL / HECA / Energy Wheel",
    description: "Risk classification, HECA library, and energy control tagging.",
    href: "/pm/sif-heca",
    icon: Atom,
  },
];

export type SmsRecordType =
  | "FLHA"
  | "JHA"
  | "Inspection"
  | "Audit"
  | "Corrective Action"
  | "Investigation";

export type SmsRecordStatus =
  | "Draft"
  | "In Progress"
  | "Submitted"
  | "Closed"
  | "Other";

export type SmsRecordRow = {
  id: string;
  type: SmsRecordType;
  title: string;
  status: SmsRecordStatus;
  updatedAt: string;
  href: string;
};

export function mapJhaStatus(status: string): SmsRecordStatus {
  if (status === "DRAFT") return "Draft";
  if (status === "SUBMITTED") return "Submitted";
  if (status === "UNDER_REVIEW" || status === "APPROVED") return "In Progress";
  if (status === "LOCKED") return "Closed";
  return "Other";
}

export function mapCapaStatus(status: string): SmsRecordStatus {
  const s = status.toLowerCase();
  if (s.includes("draft") || s === "open") return "Draft";
  if (s.includes("progress") || s === "assigned") return "In Progress";
  if (s.includes("submit")) return "Submitted";
  if (s.includes("closed") || s.includes("verified")) return "Closed";
  return "Other";
}

export function statusBadgeTone(
  status: SmsRecordStatus,
): "default" | "secondary" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "Draft":
      return "info";
    case "In Progress":
      return "warning";
    case "Submitted":
      return "secondary";
    case "Closed":
      return "success";
    default:
      return "default";
  }
}
