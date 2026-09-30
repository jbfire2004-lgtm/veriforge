import type { SafetyFormDefinition } from "@vera/api-contract";

export type FieldSection = {
  id: string;
  title: string;
  description?: string;
  fieldIds: string[];
};

const CONTEXT_IDS = new Set([
  "projectId",
  "workerId",
  "workLocation",
  "workDate",
  "equipmentId",
  "companyId",
  "siteId",
]);

const HAZARD_IDS = new Set([
  "hazards",
  "controls",
  "energyTypes",
  "riskRating",
  "energyType",
  "residualRisk",
]);

const EVIDENCE_TYPES = new Set(["photo", "signature"]);

export function groupFieldsIntoSections(
  definition: SafetyFormDefinition,
  visibleFieldIds: string[],
): FieldSection[] {
  const visible = definition.fields.filter((f) => visibleFieldIds.includes(f.id));
  const context: string[] = [];
  const hazards: string[] = [];
  const evidence: string[] = [];
  const details: string[] = [];

  for (const f of visible) {
    if (
      CONTEXT_IDS.has(f.id) ||
      f.type === "worker" ||
      f.type === "equipment" ||
      f.type === "project" ||
      f.type === "location"
    ) {
      context.push(f.id);
    } else if (HAZARD_IDS.has(f.id) || f.type === "hazard" || f.type === "energy" || f.type === "risk") {
      hazards.push(f.id);
    } else if (EVIDENCE_TYPES.has(f.type) || f.id.includes("photo") || f.id.includes("Signature")) {
      evidence.push(f.id);
    } else {
      details.push(f.id);
    }
  }

  const sections: FieldSection[] = [];
  if (context.length) {
    sections.push({
      id: "context",
      title: "Work context",
      description: "Project, worker, and location",
      fieldIds: context,
    });
  }
  if (details.length) {
    sections.push({
      id: "details",
      title: "Form details",
      description: "Task-specific information",
      fieldIds: details,
    });
  }
  if (hazards.length) {
    sections.push({
      id: "hazards",
      title: "Hazards & risk",
      description: "Identify and control risks",
      fieldIds: hazards,
    });
  }
  if (evidence.length) {
    sections.push({
      id: "evidence",
      title: "Evidence & sign-off",
      description: "Photos and signatures",
      fieldIds: evidence,
    });
  }

  if (!sections.length && visible.length) {
    sections.push({
      id: "all",
      title: definition.name,
      fieldIds: visible.map((f) => f.id),
    });
  }

  return sections;
}

export function isSectionComplete(
  section: FieldSection,
  data: Record<string, unknown>,
  requiredIds: Set<string>,
): boolean {
  for (const id of section.fieldIds) {
    if (!requiredIds.has(id)) continue;
    const v = data[id];
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
  }
  return section.fieldIds.some((id) => requiredIds.has(id));
}
