import type { SafetyFormDefinitionJson, SafetyFormFieldDefinition, SafetyFormValidationError } from './form-engine.types';
export declare class FormEngineService {
    getVisibleFields(definition: SafetyFormDefinitionJson, data: Record<string, unknown>): SafetyFormFieldDefinition[];
    validate(definition: SafetyFormDefinitionJson, data: Record<string, unknown>, partial?: boolean): SafetyFormValidationError[];
    evaluateFlags(definition: SafetyFormDefinitionJson, data: Record<string, unknown>): {
        sifFlag: boolean;
        hecaFlag: boolean;
    };
}
