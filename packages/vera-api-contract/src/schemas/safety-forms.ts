import { z } from 'zod';

export const SafetyFormFieldTypeSchema = z.enum([
  'text',
  'number',
  'select',
  'multiselect',
  'date',
  'signature',
  'photo',
  'hazard',
  'risk',
  'energy',
  'checklist',
  'table',
  'location',
  'project',
  'worker',
  'equipment',
  'textarea',
  'boolean',
]);

export const SafetyFormFieldSchema = z.object({
  id: z.string(),
  type: SafetyFormFieldTypeSchema,
  label: z.string(),
  required: z.boolean().optional(),
  options: z.array(z.union([z.string(), z.object({ value: z.string(), label: z.string() })])).optional(),
  placeholder: z.string().optional(),
  conditional: z.record(z.unknown()).optional(),
  validation: z.record(z.unknown()).optional(),
  defaultValue: z.unknown().optional(),
  helpText: z.string().optional(),
});

export const SafetyFormDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  version: z.number(),
  fields: z.array(SafetyFormFieldSchema),
  workflow: z
    .object({
      requiresSupervisor: z.boolean().optional(),
      autoGenerateCorrectiveActions: z.boolean().optional(),
      autoFlagSIF: z.boolean().optional(),
      autoFlagHECA: z.boolean().optional(),
    })
    .optional(),
});

export const CreateSafetyFormBodySchema = z.object({
  definitionId: z.string(),
  title: z.string().optional(),
  formData: z.record(z.unknown()).optional(),
  companyId: z.number().optional(),
  projectId: z.number().optional(),
  siteId: z.number().optional(),
  workerId: z.number().optional(),
  equipmentId: z.number().optional(),
  clientSyncId: z.string().optional(),
});

export const SubmitSafetyFormBodySchema = z.object({
  formData: z.record(z.unknown()),
  signatures: z
    .array(
      z.object({
        fieldId: z.string().optional(),
        signatureData: z.string(),
        signerName: z.string().optional(),
      }),
    )
    .optional(),
});

export type SafetyFormDefinition = z.infer<typeof SafetyFormDefinitionSchema>;
