/**
 * Selector catalogs and labels.
 */

import type {
  CompanySubtype,
  EntityType,
  Industry,
  ProjectSubtype,
  Scale,
  Subtype,
} from "./types";

export const INDUSTRIES: Industry[] = ["mining", "construction", "manufacturing"];

export const ENTITY_TYPES: EntityType[] = ["project", "company"];

export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  "transmission",
  "distribution",
  "substation",
  "civil",
  "industrial",
  "renewable",
];

export const COMPANY_SUBTYPES: CompanySubtype[] = [
  "utility",
  "epc",
  "contractor",
  "engineering_firm",
  "maintenance_provider",
];

export const SCALES: Scale[] = ["small", "medium", "large", "mega"];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  mining: "Mining",
  construction: "Construction",
  manufacturing: "Manufacturing",
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  project: "Project",
  company: "Company",
};

export const PROJECT_SUBTYPE_LABELS: Record<ProjectSubtype, string> = {
  transmission: "Transmission",
  distribution: "Distribution",
  substation: "Substation",
  civil: "Civil",
  industrial: "Industrial",
  renewable: "Renewable",
};

export const COMPANY_SUBTYPE_LABELS: Record<CompanySubtype, string> = {
  utility: "Utility",
  epc: "EPC",
  contractor: "Contractor",
  engineering_firm: "Engineering Firm",
  maintenance_provider: "Maintenance Provider",
};

export const SCALE_LABELS: Record<Scale, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  mega: "Mega",
};

export function subtypeLabel(entityType: EntityType, subtype: Subtype): string {
  if (entityType === "project") {
    return PROJECT_SUBTYPE_LABELS[subtype as ProjectSubtype] ?? subtype;
  }
  return COMPANY_SUBTYPE_LABELS[subtype as CompanySubtype] ?? subtype;
}

export function subtypesFor(entityType: EntityType): Subtype[] {
  return entityType === "project" ? [...PROJECT_SUBTYPES] : [...COMPANY_SUBTYPES];
}

export function defaultSubtype(entityType: EntityType): Subtype {
  return entityType === "project" ? "transmission" : "utility";
}

export function isValidSubtype(entityType: EntityType, subtype: string): boolean {
  return subtypesFor(entityType).includes(subtype as Subtype);
}

export const DEFAULT_SELECTOR_STATE = {
  industry: "construction" as Industry,
  entityType: "project" as EntityType,
  subtype: "transmission" as Subtype,
  scale: "large" as Scale,
  regionCode: "GLB",
};
