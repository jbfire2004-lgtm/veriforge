import { z } from 'zod';

export const PmSclStateSchema = z.enum(['safe', 'conditional', 'loss']);
export const PmEnergyControlStateSchema = z.enum([
  'controlled',
  'uncontrolled',
  'partially_controlled',
]);
export const PmSmsEntityTypeSchema = z.enum([
  'inspection_finding',
  'inspection_deficiency',
  'corrective_action',
  'safety_event',
  'investigation',
  'substance_test',
  'equipment_inspection',
  'jha_task',
]);

export const SmsRiskContextSchema = z.object({
  id: z.string(),
  companyId: z.number(),
  projectId: z.number().nullable().optional(),
  entityType: PmSmsEntityTypeSchema,
  entityId: z.string(),
  sclState: PmSclStateSchema.nullable().optional(),
  hecaInvolved: z.boolean(),
  hecaType: z.string().nullable().optional(),
  hecaCategoryCode: z.string().nullable().optional(),
  energyTypesJson: z.array(z.string()),
  energyControlState: PmEnergyControlStateSchema.nullable().optional(),
  highEnergyFlag: z.boolean(),
  escalationScore: z.number(),
  requiresInvestigation: z.boolean(),
});

export const SmsHecaLibraryEntrySchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  hecaType: z.enum(['critical_task', 'critical_equipment', 'both']),
  requiredControlsJson: z.array(z.string()),
  verificationStepsJson: z.array(z.string()),
  energyTypesJson: z.array(z.string()),
});

export const SmsFindingTagsInputSchema = z.object({
  companyId: z.number(),
  projectId: z.number(),
  baseSeverity: z.enum(['low', 'medium', 'high', 'critical']),
  sclState: PmSclStateSchema.optional(),
  hecaInvolved: z.boolean().optional(),
  hecaType: z.string().optional(),
  hecaCategoryCode: z.string().optional(),
  energyTypes: z.array(z.string()).optional(),
  energyControlState: PmEnergyControlStateSchema.optional(),
  highEnergyFlag: z.boolean().optional(),
});

export type SmsRiskContext = z.infer<typeof SmsRiskContextSchema>;
export type SmsHecaLibraryEntry = z.infer<typeof SmsHecaLibraryEntrySchema>;
