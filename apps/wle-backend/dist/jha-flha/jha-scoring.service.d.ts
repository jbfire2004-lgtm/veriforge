import { JhaEnergyType } from '@prisma/client';
export type SupervisorReviewFlag = {
    severity: 'critical' | 'warning' | 'info';
    code: string;
    message: string;
    hazardId?: string;
};
export type JhaEvaluationResult = {
    riskScore: number;
    taskRiskScore: number;
    sifScore: number;
    sifPotential: boolean;
    highEnergyFlag: boolean;
    qualityScore: number;
    requiresSupervisorReview: boolean;
    controlsAdequate: boolean;
    missingControls: string[];
    weakControls: string[];
    blockSubmission: boolean;
    blockReasons: string[];
    supervisorReviewFlags: SupervisorReviewFlag[];
    ppeOnlyHighEnergyHazards: string[];
};
type HazardRow = {
    id: string;
    description?: string;
    severity: number;
    likelihood: number;
    riskScore: number;
    energyTypes: unknown;
    sifIndicator: boolean;
    category: string | null;
};
type ControlRow = {
    id: string;
    hazardId: string | null;
    controlType: string;
    adequate: boolean | null;
    effectivenessScore: number | null;
    ppeRequired: boolean;
    verified: boolean;
};
export declare class JhaScoringService {
    computeHazardRisk(severity: number, likelihood: number): number;
    private hazardEnergyTypes;
    private isHighEnergyHazard;
    evaluate(input: {
        hazards: HazardRow[];
        controls: ControlRow[];
        energySources: Array<{
            energyType: JhaEnergyType;
            exposureLevel: number;
        }>;
        environmentalJson: Record<string, unknown>;
        workersCount: number;
        workersSigned: number;
        newWorkerPresent: boolean;
        equipmentUnauthorized: number;
    }): JhaEvaluationResult;
}
export {};
