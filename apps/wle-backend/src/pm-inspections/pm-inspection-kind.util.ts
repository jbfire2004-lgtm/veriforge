import type { PmInspectionTemplate } from '@prisma/client';

type TemplateLike = {
  name?: string | null;
  scoringRules?: unknown;
};

export function templateScoringRules(
  template: TemplateLike,
): Record<string, unknown> {
  if (!template.scoringRules || typeof template.scoringRules !== 'object') {
    return {};
  }
  return template.scoringRules as Record<string, unknown>;
}

export function inspectionKind(template: TemplateLike): string {
  const rules = templateScoringRules(template);
  if (typeof rules.inspectionKind === 'string') return rules.inspectionKind;
  if (template.name === 'Smart Site Inspection') return 'smart_site';
  if (template.name?.startsWith('Focus Audit —')) return 'focus_audit';
  return 'checklist';
}

export function isPhotoFirstTemplate(template: TemplateLike): boolean {
  const rules = templateScoringRules(template);
  const kind = inspectionKind(template);
  return (
    kind === 'smart_site' || kind === 'focus_audit' || rules.photoFirst === true
  );
}

export function isSmartSiteTemplate(template: TemplateLike): boolean {
  return inspectionKind(template) === 'smart_site';
}

export function skipChecklistValidation(template: TemplateLike): boolean {
  const rules = templateScoringRules(template);
  return isSmartSiteTemplate(template) || rules.skipChecklistScoring === true;
}
