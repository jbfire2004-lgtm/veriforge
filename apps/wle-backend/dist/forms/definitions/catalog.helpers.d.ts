import type { SafetyFormDefinitionJson, SafetyFormFieldDefinition, SafetyFormWorkflowDefinition } from '../engine/form-engine.types';
declare const CONTEXT_FIELDS: SafetyFormFieldDefinition[];
declare const HAZARD_FIELDS: SafetyFormFieldDefinition[];
declare const SIGNOFF_FIELDS: SafetyFormFieldDefinition[];
export declare function buildForm(id: string, name: string, category: string, fields: SafetyFormFieldDefinition[], workflow?: SafetyFormWorkflowDefinition): SafetyFormDefinitionJson;
export { CONTEXT_FIELDS, HAZARD_FIELDS, SIGNOFF_FIELDS };
