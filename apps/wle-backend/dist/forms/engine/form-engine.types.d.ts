export type SafetyFormFieldType = 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'signature' | 'photo' | 'hazard' | 'risk' | 'energy' | 'checklist' | 'table' | 'location' | 'project' | 'worker' | 'equipment' | 'textarea' | 'boolean';
export type SafetyFormConditional = {
    field: string;
    equals?: unknown;
    notEquals?: unknown;
    in?: unknown[];
    show?: boolean;
};
export type SafetyFormFieldDefinition = {
    id: string;
    type: SafetyFormFieldType;
    label: string;
    required?: boolean;
    options?: Array<{
        value: string;
        label: string;
    } | string>;
    placeholder?: string;
    conditional?: SafetyFormConditional | SafetyFormConditional[];
    validation?: Record<string, unknown>;
    defaultValue?: unknown;
    helpText?: string;
    columns?: SafetyFormFieldDefinition[];
};
export type SafetyFormCailTrigger = {
    field: string;
    equals?: unknown;
    notEquals?: unknown;
};
export type SafetyFormWorkflowDefinition = {
    requiresSupervisor?: boolean;
    autoGenerateCorrectiveActions?: boolean;
    autoGenerateCail?: boolean;
    cailSourceType?: string;
    cailTriggers?: SafetyFormCailTrigger[];
    autoFlagSIF?: boolean;
    autoFlagHECA?: boolean;
    allowedRoles?: string[];
};
export type SafetyFormDefinitionJson = {
    id: string;
    name: string;
    category: string;
    version: number;
    fields: SafetyFormFieldDefinition[];
    workflow?: SafetyFormWorkflowDefinition;
};
export type SafetyFormValidationError = {
    fieldId: string;
    message: string;
};
export declare const SAFETY_FORM_TRANSITIONS: Record<string, string[]>;
