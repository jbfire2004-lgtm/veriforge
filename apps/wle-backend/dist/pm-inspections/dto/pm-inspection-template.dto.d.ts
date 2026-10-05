export declare class TemplateScoringRulesDto {
    failThresholdPercent?: number;
    reviewThresholdRisk?: number;
}
export declare class RequiredSignatureDto {
    role: string;
    label?: string;
}
export declare class ChecklistItemDto {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    weight?: number;
    critical?: boolean;
    showIf?: Record<string, unknown>;
    options?: string[];
}
export declare class CreatePmInspectionTemplateDto {
    companyId: number;
    projectId?: number;
    name: string;
    category: string;
    description?: string;
    scoringMode?: string;
    items: ChecklistItemDto[];
    scoringRules?: TemplateScoringRulesDto;
    requiredSignatures?: RequiredSignatureDto[];
}
export declare class UpdatePmInspectionTemplateDto {
    name?: string;
    description?: string;
    scoringMode?: string;
    items?: ChecklistItemDto[];
    scoringRules?: TemplateScoringRulesDto;
    requiredSignatures?: RequiredSignatureDto[];
}
