import type {
  SafetyFormConditional,
  SafetyFormFieldDefinition,
} from './form-engine.types';

function matchesCondition(
  cond: SafetyFormConditional,
  data: Record<string, unknown>,
): boolean {
  const value = data[cond.field];
  if (cond.equals !== undefined && value !== cond.equals) return false;
  if (cond.notEquals !== undefined && value === cond.notEquals) return false;
  if (cond.in !== undefined && !cond.in.includes(value)) return false;
  return true;
}

export function isFieldVisible(
  field: SafetyFormFieldDefinition,
  data: Record<string, unknown>,
): boolean {
  const raw = field.conditional;
  if (!raw) return true;
  const conditions = Array.isArray(raw) ? raw : [raw];
  for (const cond of conditions) {
    const matched = matchesCondition(cond, data);
    const show = cond.show !== false;
    if (matched && !show) return false;
    if (matched && show) return true;
    if (!matched && show) return false;
  }
  return true;
}

export function visibleFields(
  fields: SafetyFormFieldDefinition[],
  data: Record<string, unknown>,
): SafetyFormFieldDefinition[] {
  return fields.filter((f) => isFieldVisible(f, data));
}
