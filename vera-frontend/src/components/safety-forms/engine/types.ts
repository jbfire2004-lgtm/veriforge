import type { SafetyFormDefinition } from "@vera/api-contract";

export type { SafetyFormDefinition };

export type SafetyFormEngineProps = {
  definition: SafetyFormDefinition;
  formId?: string;
  initialData?: Record<string, unknown>;
  projectId?: number;
  workerId?: number;
  companyId?: number;
  equipmentId?: number;
  readOnly?: boolean;
  onSaved?: (id: string) => void;
  onSubmitted?: (id: string) => void;
};

export const SAFETY_FORM_CATEGORIES = [
  "core",
  "equipment",
  "inspections",
  "incidents",
  "permits",
  "intelligence",
  "advanced",
] as const;

export const SAFETY_FORM_CATEGORY_LABELS: Record<string, string> = {
  core: "Core Safety",
  equipment: "Equipment & Pre-Use",
  inspections: "Safety Inspections",
  incidents: "Incidents & Emergencies",
  permits: "Access & Permits",
  intelligence: "Safety Intelligence",
  advanced: "Advanced Safety Apps",
};
