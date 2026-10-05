export type ConditionInput = {
    complianceStatus: string;
    safetyStatus: string;
    lockoutStatus: string;
    operationalStatus: string;
    lastInspectionScore?: number | null;
    openCriticalDeficiencies: number;
    expiredCertifications: number;
    chronicFailureCount: number;
};
export type ConditionResult = {
    score: number;
    riskBand: 'low' | 'medium' | 'high' | 'critical';
    factors: Record<string, number>;
};
export declare class EquipmentConditionEngine {
    score(input: ConditionInput): ConditionResult;
}
