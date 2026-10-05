export type AiGenerateInput = {
    industry: string;
    businessType: string;
    workEnvironment: string;
    hazards: string[];
    ppeRequirements: string[];
    safetyPrograms: string[];
    regulatoryRegion: string;
    companyRules?: string;
    siteRules?: string;
};
export declare class OrientationAiService {
    generate(input: AiGenerateInput): {
        sections: Record<string, unknown[]>;
        quiz: Record<string, unknown[]>;
        aiMetadata: Record<string, unknown>;
    };
}
