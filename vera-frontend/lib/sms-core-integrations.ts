/**
 * Canonical SMS Core platform integrations.
 * SMS Core is the design-system + workflow hub; these surfaces federate into it.
 */

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ClipboardList,
  HardHat,
  LayoutGrid,
  Radio,
  Shield,
} from "lucide-react";

export type SmsCoreIntegrationId =
  | "sms"
  | "projects"
  | "fieldos"
  | "erp"
  | "sif-heca"
  | "safety-hub";

export type SmsCoreIntegration = {
  id: SmsCoreIntegrationId;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

function qs(companyId?: number, projectId?: number): string {
  const p = new URLSearchParams();
  if (companyId != null) p.set("companyId", String(companyId));
  if (projectId != null) p.set("projectId", String(projectId));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Full federation set (SMS Core + the five connected modules). */
export function buildSmsCoreIntegrations(input?: {
  companyId?: number;
  projectId?: number;
}): SmsCoreIntegration[] {
  const q = qs(input?.companyId, input?.projectId);
  return [
    {
      id: "sms",
      label: "SMS Core",
      description: "SCL / HECA / energy wheel & leading indicators",
      href: `/pm/sms${q}`,
      icon: Shield,
    },
    {
      id: "projects",
      label: "Projects",
      description: "Scope SMS signals by project and readiness",
      href: `/pm/projects${q}`,
      icon: ClipboardList,
    },
    {
      id: "fieldos",
      label: "FieldOS",
      description: "Live binder — verify controls in the field",
      href: `/field${q}`,
      icon: HardHat,
    },
    {
      id: "erp",
      label: "Emergency / ERP",
      description: "Drill readiness, muster, and scenario ERPs",
      href: `/pm/emergency-response${q}`,
      icon: Radio,
    },
    {
      id: "sif-heca",
      label: "SIF / HECA",
      description: "Exposures, critical controls, energy wheel",
      href: `/pm/sif-heca${q}`,
      icon: AlertTriangle,
    },
    {
      id: "safety-hub",
      label: "Safety Hub",
      description: "Unified SIF, HECA, training, ERP & leading KPIs",
      href: `/pm/safety-hub${q}`,
      icon: LayoutGrid,
    },
  ];
}

/** Integrations shown from SMS Core (excludes self). */
export function smsCoreOutboundIntegrations(input?: {
  companyId?: number;
  projectId?: number;
}): SmsCoreIntegration[] {
  return buildSmsCoreIntegrations(input).filter((i) => i.id !== "sms");
}

/** Integrations for a sibling module (includes SMS Core, excludes self). */
export function smsCoreSiblingIntegrations(
  self: Exclude<SmsCoreIntegrationId, "sms">,
  input?: { companyId?: number; projectId?: number },
): SmsCoreIntegration[] {
  return buildSmsCoreIntegrations(input).filter((i) => i.id !== self);
}
