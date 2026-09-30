import type { ModuleTabId } from "./types";

/**
 * Standard tab order for module detail views (VERA Core §7).
 * Filter tabs per module — not every module exposes every tab.
 */
export const MODULE_TAB_ORDER: ModuleTabId[] = [
  "overview",
  "compliance",
  "assignments",
  "training",
  "inspections",
  "documents",
  "history",
  "settings",
];

export type ModuleTabDef = {
  id: ModuleTabId;
  label: string;
  /** Admin-only tab (e.g. Settings). */
  adminOnly?: boolean;
};

export const MODULE_TAB_DEFS: Record<ModuleTabId, ModuleTabDef> = {
  overview: { id: "overview", label: "Overview" },
  compliance: { id: "compliance", label: "Compliance" },
  assignments: { id: "assignments", label: "Assignments" },
  training: { id: "training", label: "Training" },
  inspections: { id: "inspections", label: "Inspections" },
  documents: { id: "documents", label: "Documents" },
  history: { id: "history", label: "History" },
  settings: { id: "settings", label: "Settings", adminOnly: true },
};

/** Tabs applicable per entity type. */
export const MODULE_TABS_BY_ENTITY: Record<
  "worker" | "equipment" | "company" | "project" | "provider",
  ModuleTabId[]
> = {
  worker: ["overview", "compliance", "assignments", "training"],
  equipment: [
    "overview",
    "compliance",
    "assignments",
    "inspections",
    "settings",
  ],
  company: ["overview", "compliance", "assignments", "training", "documents", "history"],
  project: ["overview", "compliance", "assignments", "training", "history"],
  provider: ["overview", "compliance", "training", "documents", "history", "settings"],
};

export function tabsForEntity(
  entity: keyof typeof MODULE_TABS_BY_ENTITY,
  options?: { includeAdminTabs?: boolean }
): ModuleTabDef[] {
  const ids = MODULE_TABS_BY_ENTITY[entity];
  const ordered = MODULE_TAB_ORDER.filter((id) => ids.includes(id));
  return ordered
    .map((id) => MODULE_TAB_DEFS[id])
    .filter((t) => options?.includeAdminTabs || !t.adminOnly);
}
