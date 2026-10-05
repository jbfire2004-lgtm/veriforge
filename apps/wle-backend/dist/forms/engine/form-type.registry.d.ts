import { SafetyFormType } from '@prisma/client';
export declare const FORM_TYPE_TO_DEFINITION_ID: Record<SafetyFormType, string>;
export declare const DEFINITION_ID_TO_FORM_TYPE: Record<string, SafetyFormType>;
export declare function resolveFormType(definitionId: string): SafetyFormType | null;
export declare function defaultFormData(formType: SafetyFormType): Record<string, unknown>;
