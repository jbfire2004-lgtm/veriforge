import type { VsiCailSourceType, VsiCopilotModule } from './vsi-copilot.types';
export declare const VSI_CAIL_ENVELOPE_SCHEMA = "{\n  \"hazard_type\": \"\",\n  \"risk_category\": \"\",\n  \"severity_score\": 1-5,\n  \"root_cause_category\": \"\",\n  \"root_cause_explanation\": \"\",\n  \"recommended_corrective_actions\": [],\n  \"recommended_preventive_actions\": [],\n  \"tags\": [],\n  \"lessons_learned\": \"\",\n  \"predictive_risk_flags\": []\n}";
export declare const VSI_COPILOT_SYSTEM_IDENTITY: string;
export declare const MODULE_SCHEMA_HINTS: Record<VsiCopilotModule, string>;
export type CopilotPmScope = {
    projectId?: number;
    companyId?: number;
    sourceType?: VsiCailSourceType;
};
export declare function enrichContextWithPmScope(context: Record<string, unknown>, pm?: CopilotPmScope): Record<string, unknown>;
export declare function buildModuleUserPrompt(module: VsiCopilotModule, context: Record<string, unknown>, pm?: CopilotPmScope): string;
export declare function buildCopilotMessages(module: VsiCopilotModule, context: Record<string, unknown>, pm?: CopilotPmScope): {
    system: string;
    user: string;
};
