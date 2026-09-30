import type { PmInspectionTemplate, ShowIfCondition } from "./pm-inspections";

export const TEMPLATE_CATEGORIES = [
  "PME",
  "CRANE",
  "HOUSEKEEPING",
  "FALL_PROTECTION",
  "ENVIRONMENTAL",
  "SITE",
  "VEHICLE",
  "TOOL",
  "ACCESS_EGRESS",
  "CONFINED_SPACE",
  "HOT_WORK",
  "EXCAVATION",
  "SCAFFOLDING",
  "TEMPORARY_POWER",
  "FIRE_PROTECTION",
  "CUSTOM",
] as const;

export const CHECKLIST_ITEM_TYPES = [
  "pass_fail",
  "numeric",
  "text",
  "select",
  "photo",
] as const;

export type TemplateScoringRules = {
  failThresholdPercent?: number;
  reviewThresholdRisk?: number;
};

export type RequiredSignatureRow = { role: string; label?: string };

export function newChecklistItemId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function newChecklistItem(): PmInspectionTemplate["items"][number] {
  return {
    id: newChecklistItemId(),
    label: "New item",
    type: "pass_fail",
    required: false,
    critical: false,
    weight: 1,
  };
}

export function reorderChecklistItems<T>(
  items: T[],
  index: number,
  direction: "up" | "down",
): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

export function formatSelectOptions(options?: string[]): string {
  return (options ?? []).join(", ");
}

export function parseSelectOptions(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function defaultScoringRules(): TemplateScoringRules {
  return { failThresholdPercent: 70, reviewThresholdRisk: 40 };
}

export function signaturesFromTemplate(
  template?: Pick<PmInspectionTemplate, "requiredSignatures">,
): RequiredSignatureRow[] {
  return (template?.requiredSignatures ?? []).map((row) => ({ ...row }));
}

export function scoringRulesFromTemplate(
  template?: Pick<PmInspectionTemplate, "scoringRules">,
): TemplateScoringRules {
  const rules = template?.scoringRules ?? {};
  return {
    failThresholdPercent: rules.failThresholdPercent ?? 70,
    reviewThresholdRisk: rules.reviewThresholdRisk ?? 40,
  };
}

export function isLeafShowIf(
  condition: ShowIfCondition,
): condition is { itemId: string; equals: unknown } {
  return "itemId" in condition && typeof condition.itemId === "string";
}

export function showIfEqualsLabel(value: unknown): string {
  if (value === true) return "pass";
  if (value === false) return "fail";
  return String(value);
}

export function parseShowIfEquals(raw: string): unknown {
  if (raw === "pass") return true;
  if (raw === "fail") return false;
  return raw;
}

export function validateBuilderForm(input: {
  name: string;
  items: PmInspectionTemplate["items"];
}): string | null {
  if (!input.name.trim()) return "Template name is required";
  if (!input.items.length) return "Add at least one checklist item";
  for (const item of input.items) {
    if (!item.label.trim()) return "Every checklist item needs a label";
  }
  return null;
}

export function buildTemplatePayload(input: {
  companyId: number;
  projectId?: number;
  name: string;
  description?: string;
  category: string;
  scoringMode: string;
  items: PmInspectionTemplate["items"];
  scoringRules: TemplateScoringRules;
  requiredSignatures: RequiredSignatureRow[];
}) {
  return {
    companyId: input.companyId,
    projectId: input.projectId,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    category: input.category,
    scoringMode: input.scoringMode,
    items: input.items.map((item) => ({
      ...item,
      label: item.label.trim(),
      critical: Boolean(item.critical),
      options:
        item.type === "select"
          ? (item.options ?? []).map((opt) => opt.trim()).filter(Boolean)
          : item.options,
      weight:
        input.scoringMode === "weighted" &&
        (item.type === "pass_fail" || item.type === "numeric")
          ? item.weight ?? 1
          : item.weight,
    })),
    scoringRules: input.scoringRules,
    requiredSignatures: input.requiredSignatures.filter((row) => row.role.trim()),
  };
}
