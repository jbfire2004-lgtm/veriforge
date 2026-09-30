/**
 * FieldOS ModuleNav features — live binder packets with dedicated /field/* shells.
 */

export type FieldOsModuleId =
  | "equipment_readiness"
  | "crew_readiness"
  | "safety_pulse"
  | "task_sync"
  | "incident_capture"
  | "offline_mode"
  | "analytics_snapshot";

export type FieldOsModuleDef = {
  id: FieldOsModuleId;
  label: string;
  description: string;
  /** Route under /field */
  slug: string;
  href: string;
  eyebrow: string;
  offlineCapable: boolean;
};

export const FIELD_OS_MODULES: FieldOsModuleDef[] = [
  {
    id: "equipment_readiness",
    label: "Equipment Readiness",
    description:
      "Confirm inspections, flag out-of-service gear, and clear equipment alerts before use.",
    slug: "equipment-readiness",
    href: "/field/equipment-readiness",
    eyebrow: "Module 1",
    offlineCapable: true,
  },
  {
    id: "crew_readiness",
    label: "Crew Readiness",
    description:
      "Verify tickets on site, surface training gaps, and queue cert sync when connectivity returns.",
    slug: "crew-readiness",
    href: "/field/crew-readiness",
    eyebrow: "Module 2",
    offlineCapable: true,
  },
  {
    id: "safety_pulse",
    label: "Safety Pulse",
    description:
      "Live safety brief pulse — toolbox talks, permits, FLHA, and emergency quick access.",
    slug: "safety-pulse",
    href: "/field/safety-pulse",
    eyebrow: "Module 3",
    offlineCapable: true,
  },
  {
    id: "task_sync",
    label: "Task Sync",
    description:
      "Pending and failed field tasks — sync the binder queue and resolve conflicts.",
    slug: "task-sync",
    href: "/field/task-sync",
    eyebrow: "Module 4",
    offlineCapable: true,
  },
  {
    id: "incident_capture",
    label: "Incident Capture",
    description:
      "Log field events, queue PM incident sync, and jump to emergency quick access.",
    slug: "incident-capture",
    href: "/field/incident-capture",
    eyebrow: "Module 5",
    offlineCapable: true,
  },
  {
    id: "offline_mode",
    label: "Offline Mode",
    description:
      "Connectivity status, binder cache preload, and offline queue controls.",
    slug: "offline",
    href: "/field/offline",
    eyebrow: "Module 6",
    offlineCapable: true,
  },
  {
    id: "analytics_snapshot",
    label: "Analytics Snapshot",
    description:
      "Field KPIs and anomaly signals — drill into Field Operations and Safety Intelligence.",
    slug: "analytics",
    href: "/field/analytics",
    eyebrow: "Module 7",
    offlineCapable: false,
  },
];

export function getFieldOsModule(id: FieldOsModuleId): FieldOsModuleDef {
  const mod = FIELD_OS_MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown FieldOS module: ${id}`);
  return mod;
}

export function fieldModuleHref(
  slugOrHref: string,
  projectId?: number,
  companyId?: number,
): string {
  const base = slugOrHref.startsWith("/")
    ? slugOrHref
    : `/field/${slugOrHref}`;
  const q = new URLSearchParams();
  if (projectId != null) q.set("projectId", String(projectId));
  if (companyId != null) q.set("companyId", String(companyId));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}
