import type { SafetyFormFieldDefinition } from './form-engine.types';
export declare function isFieldVisible(field: SafetyFormFieldDefinition, data: Record<string, unknown>): boolean;
export declare function visibleFields(fields: SafetyFormFieldDefinition[], data: Record<string, unknown>): SafetyFormFieldDefinition[];
