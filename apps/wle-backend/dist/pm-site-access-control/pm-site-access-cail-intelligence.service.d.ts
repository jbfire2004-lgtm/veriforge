import { PrismaService } from '../prisma/prisma.service';
export type AccessCailInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
};
export declare class PmSiteAccessCailIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    projectInsights(projectId: number): Promise<AccessCailInsight[]>;
    workerRiskScore(denialCount: number, openCapa: number): number;
    zoneRiskScore(rule: {
        highRisk: boolean;
        zoneType: string;
    }): number;
    predictAccessDenial(workerId: number, projectId: number): Promise<{
        predictiveDenialLikelihood: number;
        workerRiskScore: number;
        denialRate30d: number;
        attempts30d: number;
        denials30d: number;
        openCapa: number;
        chronicNonCompliance: boolean;
    }>;
    predictEquipmentRisk(equipmentId: number, projectId?: number): Promise<{
        equipmentId: number;
        projectId: number;
        equipmentRiskScore: number;
        accessBlocked: boolean;
        openFailures: number;
        predictiveDenialLikelihood: number;
    }>;
    predictZoneRisk(projectId: number, zoneCode: string): Promise<{
        zoneCode: string;
        zoneRiskScore: number;
        predictiveDenialLikelihood: number;
        zoneType?: undefined;
        denialRate30d?: undefined;
        highRisk?: undefined;
    } | {
        zoneCode: string;
        zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
        zoneRiskScore: number;
        predictiveDenialLikelihood: number;
        denialRate30d: number;
        highRisk: boolean;
    }>;
}
