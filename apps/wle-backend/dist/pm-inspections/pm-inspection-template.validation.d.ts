import type { ChecklistItemDef } from './pm-inspections.constants';
export type RequiredSignatureDef = {
    role: string;
    label?: string;
};
export type TemplateScoringRules = {
    failThresholdPercent?: number;
    reviewThresholdRisk?: number;
};
export declare function validateChecklistItems(items: ChecklistItemDef[]): void;
export declare function validateRequiredSignatures(signatures: unknown): RequiredSignatureDef[];
export declare function validateScoringRules(rules: unknown): TemplateScoringRules;
export declare function normalizeChecklistItems(items: ChecklistItemDef[]): ChecklistItemDef[];
