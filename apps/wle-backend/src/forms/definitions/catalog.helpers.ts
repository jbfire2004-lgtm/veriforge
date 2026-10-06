import type {
  SafetyFormDefinitionJson,
  SafetyFormFieldDefinition,
  SafetyFormWorkflowDefinition,
} from '../engine/form-engine.types';

const CONTEXT_FIELDS: SafetyFormFieldDefinition[] = [
  { id: 'projectId', type: 'project', label: 'Project', required: false },
  { id: 'workerId', type: 'worker', label: 'Worker', required: true },
  { id: 'workLocation', type: 'text', label: 'Work location' },
  { id: 'workDate', type: 'date', label: 'Date', required: true },
];

const HAZARD_FIELDS: SafetyFormFieldDefinition[] = [
  {
    id: 'hazards',
    type: 'hazard',
    label: 'Hazards identified',
    required: true,
  },
  { id: 'controls', type: 'text', label: 'Control measures' },
  { id: 'energyTypes', type: 'energy', label: 'Energy sources' },
  { id: 'riskRating', type: 'risk', label: 'Risk rating' },
];

const SIGNOFF_FIELDS: SafetyFormFieldDefinition[] = [
  {
    id: 'workerSignature',
    type: 'signature',
    label: 'Worker signature',
    required: true,
  },
  {
    id: 'supervisorSignature',
    type: 'signature',
    label: 'Supervisor signature',
    conditional: { field: '__requiresSupervisor', equals: true },
  },
];

const PHOTO_FIELD: SafetyFormFieldDefinition = {
  id: 'photos',
  type: 'photo',
  label: 'Photos / attachments',
};

export function buildForm(
  id: string,
  name: string,
  category: string,
  fields: SafetyFormFieldDefinition[],
  workflow?: SafetyFormWorkflowDefinition,
): SafetyFormDefinitionJson {
  return {
    id,
    name,
    category,
    version: 1,
    fields: [...CONTEXT_FIELDS, ...fields, PHOTO_FIELD, ...SIGNOFF_FIELDS],
    workflow: {
      requiresSupervisor: true,
      autoGenerateCorrectiveActions: false,
      autoFlagSIF: false,
      autoFlagHECA: false,
      ...workflow,
    },
  };
}

export { CONTEXT_FIELDS, HAZARD_FIELDS, SIGNOFF_FIELDS };
