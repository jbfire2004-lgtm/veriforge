type TemplateLike = {
    name?: string | null;
    scoringRules?: unknown;
};
export declare function templateScoringRules(template: TemplateLike): Record<string, unknown>;
export declare function inspectionKind(template: TemplateLike): string;
export declare function isPhotoFirstTemplate(template: TemplateLike): boolean;
export declare function isSmartSiteTemplate(template: TemplateLike): boolean;
export declare function skipChecklistValidation(template: TemplateLike): boolean;
export {};
