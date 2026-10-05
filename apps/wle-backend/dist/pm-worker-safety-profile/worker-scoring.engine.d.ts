import { PmProjectSafetyRiskLevel } from '@prisma/client';
export type WorkerScoreInputs = {
    expiredTraining: number;
    missingTraining: number;
    openCapa: number;
    overdueCapa: number;
    sifCapa: number;
    incidentCount12m: number;
    hazardExposureHigh: number;
    accessDenials30d: number;
    accessAttempts30d: number;
    expiredAuths: number;
    activeMedicalBlocks: number;
    missingSdsAck: number;
    missingPolicyAck: number;
    staleFlha: boolean;
    poorMeetingAttendance: boolean;
};
export type WorkerScoreResult = {
    score: number;
    riskLevel: PmProjectSafetyRiskLevel;
    factors: Record<string, number>;
    requiredActions: string[];
    requiresSupervisorReview: boolean;
};
export declare class WorkerScoringEngine {
    compute(input: WorkerScoreInputs): WorkerScoreResult;
}
