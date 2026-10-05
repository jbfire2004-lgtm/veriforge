export type HecaClassificationInput = {
    description: string;
    energyTypes: string[];
    equipmentType?: string;
    taskType?: string;
    categories: Array<{
        code: string;
        label: string;
        keywordPatterns: string[];
        energyTypes: string[];
        severityDefault: number;
    }>;
};
export type HecaClassificationOutput = {
    hecaCategoryCode: string;
    hecaCategoryLabel: string;
    severity: number;
    likelihood: number;
    hecaRiskScore: number;
    highEnergyFlag: boolean;
    requiredControls: string[];
    requiredCorrective: string[];
    explainability: Array<{
        rule: string;
        detail: string;
    }>;
};
export declare class HecaClassificationEngine {
    classify(input: HecaClassificationInput): HecaClassificationOutput;
}
