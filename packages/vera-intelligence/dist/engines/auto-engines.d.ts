import type { ClassificationResult, SummaryResult, TrainingIntelInput } from "../types";
export declare class AutoClassificationEngine {
    classifyTraining(input: TrainingIntelInput): ClassificationResult;
    classifyInspectionPhoto(_hints?: {
        hazards?: string[];
    }): ClassificationResult;
}
export declare class AutoTaggingEngine {
    tag(entityType: string, signals: Record<string, boolean>): string[];
}
export declare class AutoSummarizationEngine {
    summarize(title: string, bullets: string[]): SummaryResult;
}
export declare class AutoCorrectionEngine {
    suggestCorrections(issues: string[]): string[];
}
export declare class AutoMappingEngine {
    mapTrainingToStandards(input: TrainingIntelInput): {
        csa: string[];
        ohs: string[];
    };
}
export declare class AutoPrioritizationEngine {
    prioritize<T extends {
        priority: number;
    }>(items: T[]): T[];
}
//# sourceMappingURL=auto-engines.d.ts.map