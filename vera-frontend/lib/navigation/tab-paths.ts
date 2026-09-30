import type { ModuleTabId } from "./types";

/** URL segment overrides per entity (tab id → path segment). */
export const ENTITY_TAB_SEGMENT: Record<
  "worker" | "equipment" | "company" | "project" | "provider",
  Partial<Record<ModuleTabId, string>>
> = {
  worker: {
    compliance: "competency",
    assignments: "equipment",
  },
  equipment: {
    assignments: "assign-project",
    inspections: "inspections",
    settings: "edit",
  },
  company: {},
  project: {},
  provider: {
    training: "courses",
    settings: "settings",
  },
};

export function resolveTabHref(
  basePath: string,
  tabId: ModuleTabId,
  entity: keyof typeof ENTITY_TAB_SEGMENT
): string {
  if (tabId === "overview") return basePath;
  const segment = ENTITY_TAB_SEGMENT[entity][tabId] ?? tabId;
  return `${basePath}/${segment}`;
}
