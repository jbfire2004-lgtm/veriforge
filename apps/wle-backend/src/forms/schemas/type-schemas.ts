import { z } from 'zod';
import { SafetyFormType } from '@prisma/client';

const contextSchema = z.object({
  projectId: z.union([z.number(), z.string()]).optional(),
  workerId: z.union([z.number(), z.string()]).optional(),
  workDate: z.string().optional(),
  workLocation: z.string().optional(),
});

const jhaSchema = contextSchema.extend({
  jobTitle: z.string().min(1),
  taskSteps: z.array(z.record(z.string(), z.unknown())).min(1),
  hazards: z.array(z.unknown()).min(1),
});

const flhaSchema = contextSchema.extend({
  taskDescription: z.string().min(1),
  hazards: z.array(z.unknown()).min(1),
  controlsAdequate: z.enum(['yes', 'no', 'partial']),
});

const sifSchema = contextSchema.extend({
  activity: z.string().min(1),
  sifPotential: z.boolean(),
  severity: z.enum(['low', 'medium', 'high', 'SIF']),
  criticalControls: z.string().min(1),
});

const hecaSchema = contextSchema.extend({
  observationType: z.enum(['HECA', 'safe', 'at_risk']),
  hecaCategory: z.string().min(1),
  behaviorObserved: z.string().min(1),
});

const energyWheelSchema = contextSchema.extend({
  taskDescription: z.string().min(1),
  energyTypes: z.array(z.string()).min(1),
  controls: z.string().min(1),
});

const inspectionSchema = contextSchema.extend({
  inspectionArea: z.string().min(1),
  inspectionType: z.string().min(1),
  complianceRating: z.enum([
    'compliant',
    'minor_issues',
    'major_issues',
    'stop_work',
  ]),
  hazards: z.array(z.unknown()).min(1),
});

const SCHEMAS: Partial<Record<SafetyFormType, z.ZodTypeAny>> = {
  JHA: jhaSchema,
  FLHA: flhaSchema,
  SIF: sifSchema,
  HECA: hecaSchema,
  ENERGY_WHEEL: energyWheelSchema,
  INSPECTION: inspectionSchema,
};

export function validateFormTypeData(
  formType: SafetyFormType | null | undefined,
  data: Record<string, unknown>,
  partial = false,
): Array<{ fieldId: string; message: string }> {
  if (!formType || partial) return [];
  const schema = SCHEMAS[formType];
  if (!schema) return [];
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    fieldId: issue.path.join('.') || 'form',
    message: issue.message,
  }));
}
