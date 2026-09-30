/**
 * FieldOS live field binder — section model & deep links.
 * Packets map 1:1 to FieldOS ModuleNav features; legacy routes stay as secondary.
 */

import {
  FIELD_OS_MODULES,
  fieldModuleHref,
  type FieldOsModuleId,
} from "./modules";

export type FieldBinderSectionId = FieldOsModuleId;

export type FieldBinderSection = {
  id: FieldBinderSectionId;
  label: string;
  eyebrow: string;
  description: string;
  /** Primary in-FieldOS or PM route */
  href: string;
  secondary?: Array<{ label: string; href: string }>;
  offlineCapable: boolean;
};

export function binderQuery(projectId?: number, companyId?: number): string {
  const q = new URLSearchParams();
  if (projectId != null) q.set("projectId", String(projectId));
  if (companyId != null) q.set("companyId", String(companyId));
  const s = q.toString();
  return s ? `?${s}` : "";
}

function secondaryFor(
  id: FieldOsModuleId,
  qs: string,
): Array<{ label: string; href: string }> {
  switch (id) {
    case "equipment_readiness":
      return [
        { label: "Scan equipment QR", href: `/field/scan${qs}` },
        { label: "Equipment safety", href: `/pm/equipment-safety${qs}` },
        { label: "Operations alerts", href: `/field/operations${qs}` },
      ];
    case "crew_readiness":
      return [
        { label: "Worker scan", href: `/field/scan${qs}` },
        { label: "Training dashboard", href: `/admin/training/dashboard${qs}` },
        { label: "Core readiness", href: `/core/readiness${qs}` },
      ];
    case "safety_pulse":
      return [
        { label: "Permits & forms", href: `/field/permits${qs}` },
        { label: "JHA", href: `/field/safety/jha${qs}` },
        { label: "FLHA", href: `/field/safety/flha${qs}` },
        { label: "Safety meetings", href: `/pm/safety-meetings${qs}` },
        {
          label: "Emergency quick access",
          href: `/pm/emergency-response/quick${qs}`,
        },
        {
          label: "ERP drill",
          href: `/pm/emergency-response/drill${qs}`,
        },
      ];
    case "task_sync":
      return [
        { label: "Sync queue", href: `/field/pending${qs}` },
        { label: "Conflicts", href: `/field/conflicts${qs}` },
        { label: "Permits tasks", href: `/field/permits${qs}` },
        { label: "Scan QR", href: `/field/scan${qs}` },
      ];
    case "incident_capture":
      return [
        { label: "New incident", href: `/pm/incidents/new${qs}` },
        { label: "Incident list", href: `/pm/incidents${qs}` },
        {
          label: "Emergency quick access",
          href: `/pm/emergency-response/quick${qs}`,
        },
      ];
    case "offline_mode":
      return [
        { label: "Pending queue", href: `/field/pending${qs}` },
        { label: "Conflicts", href: `/field/conflicts${qs}` },
        { label: "Offline scan", href: `/field/scan${qs}` },
      ];
    case "analytics_snapshot":
      return [
        { label: "Field operations", href: `/field/operations${qs}` },
        {
          label: "Safety Intelligence",
          href: `/pm/safety-intelligence${qs}`,
        },
        { label: "Projects", href: `/pm/projects${qs}` },
        {
          label: "Action Management",
          href: `/pm/action-management${qs}`,
        },
      ];
    default:
      return [];
  }
}

export function getFieldBinderSections(
  projectId?: number,
  companyId?: number,
): FieldBinderSection[] {
  const qs = binderQuery(projectId, companyId);
  return FIELD_OS_MODULES.map((mod) => ({
    id: mod.id,
    label: mod.label,
    eyebrow: mod.eyebrow,
    description: mod.description,
    href: fieldModuleHref(mod.href, projectId, companyId),
    secondary: secondaryFor(mod.id, qs),
    offlineCapable: mod.offlineCapable,
  }));
}
