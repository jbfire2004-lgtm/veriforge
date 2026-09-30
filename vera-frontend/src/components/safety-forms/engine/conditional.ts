import type { SafetyFormDefinition } from "@vera/api-contract";

type Conditional = {
  field: string;
  equals?: unknown;
  notEquals?: unknown;
  in?: unknown[];
  show?: boolean;
};

type FieldLike = {
  id: string;
  conditional?: Conditional | Conditional[];
};

function matches(cond: Conditional, data: Record<string, unknown>): boolean {
  const v = data[cond.field];
  if (cond.equals !== undefined && v !== cond.equals) return false;
  if (cond.notEquals !== undefined && v === cond.notEquals) return false;
  if (cond.in !== undefined && !cond.in.includes(v)) return false;
  return true;
}

export function isFieldVisible(field: FieldLike, data: Record<string, unknown>): boolean {
  const raw = field.conditional;
  if (!raw) return true;
  const list = Array.isArray(raw) ? raw : [raw];
  for (const cond of list) {
    const matched = matches(cond, data);
    const show = cond.show !== false;
    if (matched && !show) return false;
    if (matched && show) return true;
    if (!matched && show) return false;
  }
  return true;
}

export function visibleFields(
  definition: SafetyFormDefinition,
  data: Record<string, unknown>,
) {
  const ctx = {
    ...data,
    __requiresSupervisor: definition.workflow?.requiresSupervisor === true,
  };
  return definition.fields.filter((f) => isFieldVisible(f, ctx));
}
