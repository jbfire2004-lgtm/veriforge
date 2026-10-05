import { PmProjectSafetyRiskLevel } from '@prisma/client';
export type ProfileGeneratorInput = {
    projectType?: string;
    scopeOfWork?: Record<string, unknown>;
    equipmentCount?: number;
    subcontractorCount?: number;
    incidentCount12m?: number;
    sifEventCount12m?: number;
    environmental?: Record<string, unknown>;
};
export type GeneratedProfileRequirements = {
    riskLevel: PmProjectSafetyRiskLevel;
    requiredJhaTypes: string[];
    requiredInspections: Array<{
        type: string;
        cadenceDays: number;
    }>;
    requiredTraining: string[];
    requiredEquipmentCerts: string[];
    requiredPpe: string[];
    requiredEmergencyPlans: boolean;
    requiredSdsAcks: boolean;
    requiredToolboxTalks: {
        frequencyDays: number;
    };
    enforcementRules: Record<string, unknown>;
    zoneRules: Array<Record<string, unknown>>;
    equipmentRules: Record<string, unknown>;
    trainingRules: Record<string, unknown>;
    emergencyRules: Record<string, unknown>;
};
export declare class ProfileGeneratorEngine {
    generate(input: ProfileGeneratorInput): GeneratedProfileRequirements;
}
