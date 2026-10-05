import { PmProjectHazardCategory } from '@prisma/client';
export declare class CompanyProjectSyncEngine {
    mapHazardCategory(companyCategory: string): PmProjectHazardCategory;
    zoneTemplateToAccessRule(template: {
        templateCode: string;
        zoneType: string;
        requiresFlhaHours: number;
        requiresJha: boolean;
        requiresSdsAck: boolean;
        highRisk: boolean;
        requiredPpe: unknown;
        requiredTraining: unknown;
    }): {
        zoneCode: string;
        zoneType: string;
        requiresFlhaHours: number;
        requiresJha: boolean;
        requiresSdsAck: boolean;
        highRisk: boolean;
        requiredPpe: unknown;
        requiresTrainingCodes: unknown;
    };
}
