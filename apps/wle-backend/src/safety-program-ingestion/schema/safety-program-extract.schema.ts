import { z } from 'zod';

const nullStr = z.string().nullable();
const strArr = z.array(z.string());

export const SafetyHazardSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: nullStr,
  /** Additive normalized vocabulary — original `category` is preserved. */
  category_normalized: nullStr.optional(),
  severity: nullStr,
  likelihood: nullStr,
  consequences: strArr,
  related_activities: strArr,
  regulatory_references: strArr,
});

export const SafetyControlSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: nullStr,
  type_normalized: nullStr.optional(),
  hierarchy_level: nullStr,
  hierarchy_level_normalized: nullStr.optional(),
  required: z.boolean().nullable(),
  preconditions: strArr,
  steps: strArr,
  related_hazards: strArr,
  regulatory_references: strArr,
});

export const SafetyPpeSchema = z.object({
  item: z.string(),
  mandatory: z.boolean().nullable(),
  conditions: strArr,
  standards: strArr,
});

export const SafetyTrainingReqSchema = z.object({
  name: z.string(),
  description: z.string(),
  frequency: nullStr,
  target_roles: strArr,
  target_roles_normalized: strArr.optional(),
  prerequisites: strArr,
  regulatory_references: strArr,
});

export const SafetyRoleSchema = z.object({
  role: z.string(),
  role_normalized: nullStr.optional(),
  responsibilities: strArr,
  authority_limits: strArr,
  regulatory_references: strArr,
});

export const SafetyProcedureSchema = z.object({
  name: z.string(),
  scope: nullStr,
  pre_job_requirements: strArr,
  step_by_step: strArr,
  post_job_requirements: strArr,
  related_hazards: strArr,
  related_controls: strArr,
  regulatory_references: strArr,
});

export const SafetyInspectionSchema = z.object({
  type: z.string(),
  subject: z.string(),
  criteria: strArr,
  frequency: nullStr,
  recordkeeping_requirements: strArr,
  regulatory_references: strArr,
});

export const SafetyIncidentSchema = z.object({
  type: z.string(),
  description: z.string(),
  root_causes: strArr,
  corrective_actions: strArr,
  preventive_actions: strArr,
  responsible_roles: strArr,
  due_dates: strArr,
  regulatory_references: strArr,
});

export const SafetyProgramExtractSchema = z.object({
  meta: z.object({
    is_safety_document: z.boolean(),
    document_title: nullStr,
    document_type: nullStr,
    source_reference: nullStr,
    version: nullStr,
    effective_date: nullStr,
    last_review_date: nullStr,
    jurisdiction: nullStr,
    regulatory_frameworks: strArr,
  }),
  work_context: z.object({
    work_activities: strArr,
    locations: strArr,
    equipment: strArr,
    materials: strArr,
    environmental_conditions: strArr,
  }),
  hazards: z.array(SafetyHazardSchema),
  controls: z.array(SafetyControlSchema),
  ppe: z.array(SafetyPpeSchema),
  training_requirements: z.array(SafetyTrainingReqSchema),
  roles_and_responsibilities: z.array(SafetyRoleSchema),
  procedures: z.array(SafetyProcedureSchema),
  inspection_and_monitoring: z.array(SafetyInspectionSchema),
  incident_and_corrective_actions: z.array(SafetyIncidentSchema),
  conflicts_and_gaps: z.object({
    internal_conflicts: strArr,
    known_gaps: strArr,
    assumptions: strArr,
  }),
});

export type SafetyProgramExtract = z.infer<typeof SafetyProgramExtractSchema>;

/** Empty / non-safety skeleton — no invented values. */
export function emptySafetyProgramExtract(
  isSafety: boolean,
): SafetyProgramExtract {
  return {
    meta: {
      is_safety_document: isSafety,
      document_title: null,
      document_type: null,
      source_reference: null,
      version: null,
      effective_date: null,
      last_review_date: null,
      jurisdiction: null,
      regulatory_frameworks: [],
    },
    work_context: {
      work_activities: [],
      locations: [],
      equipment: [],
      materials: [],
      environmental_conditions: [],
    },
    hazards: [],
    controls: [],
    ppe: [],
    training_requirements: [],
    roles_and_responsibilities: [],
    procedures: [],
    inspection_and_monitoring: [],
    incident_and_corrective_actions: [],
    conflicts_and_gaps: {
      internal_conflicts: [],
      known_gaps: [],
      assumptions: [],
    },
  };
}

export function parseSafetyProgramExtract(
  value: unknown,
): SafetyProgramExtract {
  return SafetyProgramExtractSchema.parse(value);
}
