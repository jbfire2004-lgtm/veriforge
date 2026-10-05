export type SifScoringInput = {
    hazardSeverity: number;
    hazardLikelihood: number;
    energyTypes: string[];
    controlStrength: number;
    workerCompetencyGap: boolean;
    equipmentConditionPoor: boolean;
    environmentRisk: boolean;
    historicalIncidents12mo: number;
    missingControls: number;
    weakControls: number;
};
export type SifScoringOutput = {
    sifScore: number;
    sifCategory: 'low' | 'medium' | 'high' | 'critical';
    severityComponent: number;
    likelihoodComponent: number;
    energyComponent: number;
    controlComponent: number;
    competencyComponent: number;
    equipmentComponent: number;
    environmentComponent: number;
    historyComponent: number;
    requiresSupervisorReview: boolean;
    requiredControls: string[];
    requiredActions: string[];
    explainability: Array<{
        rule: string;
        points: number;
        detail: string;
    }>;
};
export declare class SifScoringEngine {
    score(input: SifScoringInput): SifScoringOutput;
}
