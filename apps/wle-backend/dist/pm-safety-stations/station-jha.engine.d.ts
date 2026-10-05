import { PrismaService } from '../prisma/prisma.service';
export type JhaStationValidation = {
    valid: boolean;
    jhaFlhaId?: string;
    denialReasons: string[];
    checks: Record<string, boolean>;
    requiredPpe: string[];
};
export declare class StationJhaEngine {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateForStation(input: {
        workerId: number;
        projectId: number;
        zoneCode: string;
        requiresJha: boolean;
        flhaHours: number;
        equipmentId?: number;
    }): Promise<JhaStationValidation>;
    syncPayload(projectId: number): Promise<{
        activeJhas: {
            id: string;
            status: import(".prisma/client").$Enums.JhaFlhaStatus;
            signatures: {
                role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
                signedAt: Date;
                signerUserId: number;
            }[];
            kind: import(".prisma/client").$Enums.JhaFlhaKind;
            workers: {
                workerId: number;
            }[];
            approvedAt: Date;
            taskDescription: string;
        }[];
        zoneJhaRules: {
            zoneCode: string;
            requiresFlhaHours: number;
            requiresJha: boolean;
        }[];
    }>;
}
