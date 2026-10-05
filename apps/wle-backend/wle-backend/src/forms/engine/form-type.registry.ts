import { SafetyFormType } from '@prisma/client';

export const FORM_TYPE_TO_DEFINITION_ID: Record<SafetyFormType, string> = {
  JHA: 'jha',
  FLHA: 'flha',
  SIF: 'sif',
  HECA: 'heca',
  ENERGY_WHEEL: 'energy-wheel',
  INSPECTION: 'inspection',
};

export const DEFINITION_ID_TO_FORM_TYPE: Record<string, SafetyFormType> = {
  jha: SafetyFormType.JHA,
  flha: SafetyFormType.FLHA,
  'daily-flha': SafetyFormType.FLHA,
  sif: SafetyFormType.SIF,
  heca: SafetyFormType.HECA,
  'heca-observation': SafetyFormType.HECA,
  'energy-wheel': SafetyFormType.ENERGY_WHEEL,
  inspection: SafetyFormType.INSPECTION,
  'general-inspection': SafetyFormType.INSPECTION,
  'pre-use-inspection': SafetyFormType.INSPECTION,
};

export function resolveFormType(definitionId: string): SafetyFormType | null {
  return DEFINITION_ID_TO_FORM_TYPE[definitionId] ?? null;
}

export function defaultFormData(
  formType: SafetyFormType,
): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  const base = { workDate: today };
  switch (formType) {
    case SafetyFormType.JHA:
      return { ...base, taskSteps: [], hazards: [] };
    case SafetyFormType.FLHA:
      return { ...base, hazards: [], controlsAdequate: 'yes' };
    case SafetyFormType.SIF:
      return {
        ...base,
        sifPotential: false,
        severity: 'medium',
        precursors: [],
      };
    case SafetyFormType.HECA:
      return { ...base, observationType: 'HECA' };
    case SafetyFormType.ENERGY_WHEEL:
      return { ...base, energyTypes: [], isolationRequired: false };
    case SafetyFormType.INSPECTION:
      return { ...base, complianceRating: 'compliant', hazards: [] };
    default:
      return base;
  }
}
