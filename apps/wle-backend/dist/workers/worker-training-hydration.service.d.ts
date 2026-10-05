import { PmCompanyTrainingRoleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type TrainingItemStatus = 'valid' | 'expired' | 'missing';
export type WorkerTrainingRequirement = {
    code: string;
    name: string;
    status: TrainingItemStatus;
    matchedRecordId: number | null;
    expiresAt: string | null;
};
export type WorkerTrainingHydration = {
    workerId: number;
    companyId: number | null;
    records: Array<{
        id: number;
        certificationId: number;
        code: string;
        name: string;
        issuedAt: string;
        expiresAt: string | null;
        completedAt: string | null;
        status: 'valid' | 'expired';
        certificateNumber: string | null;
        certificateUrl: string | null;
        projectId: number | null;
        companyId: number | null;
    }>;
    competencies: Array<{
        id: number;
        equipmentTypeKey: string;
        equipmentName: string | null;
        score: number;
        passed: boolean;
        evaluationDate: string;
        expiresAt: string | null;
        status: TrainingItemStatus;
    }>;
    certifications: Array<{
        id: number;
        code: string;
        name: string;
        latestRecordId: number;
        expiresAt: string | null;
        status: 'valid' | 'expired';
    }>;
    expiries: Array<{
        type: 'training' | 'competency' | 'restriction';
        key: string;
        name: string;
        expiresAt: string;
        status: 'valid' | 'expired';
    }>;
    restrictions: Array<{
        id: string;
        type: string;
        description: string;
        blocksHighRisk: boolean;
        blocksConfinedSpace: boolean;
        blocksHotWork: boolean;
        blocksEquipment: boolean;
        startsAt: string;
        expiresAt: string | null;
        active: boolean;
    }>;
    requirements: WorkerTrainingRequirement[];
    summary: {
        valid: number;
        expired: number;
        missing: number;
        totalRecords: number;
        hasBlockingRestrictions: boolean;
    };
    hydratedAt: string;
};
type HydrationOptions = {
    roleType?: PmCompanyTrainingRoleType;
    requiredCodes?: string[];
    projectId?: number;
};
export declare class WorkerTrainingHydrationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    matchTrainingCode(cert: {
        code: string | null;
        name: string;
    }, requiredCode: string): boolean;
    recordStatus(record: {
        expiresAt: Date | null;
        issuedAt: Date;
    }, now: Date): 'valid' | 'expired';
    buildRequirements(requiredCodes: string[], records: Array<{
        id: number;
        expiresAt: Date | null;
        issuedAt: Date;
        certification: {
            code: string | null;
            name: string;
        };
    }>, now: Date): WorkerTrainingRequirement[];
    hydrateWorkerTraining(workerId: number, options?: HydrationOptions): Promise<WorkerTrainingHydration>;
    validateRequiredTraining(workerId: number, requiredCodes: string[]): Promise<{
        valid: boolean;
        requirements: WorkerTrainingRequirement[];
        failures: WorkerTrainingRequirement[];
        hasBlockingRestrictions: boolean;
        restrictions: {
            id: string;
            type: string;
            description: string;
            blocksHighRisk: boolean;
            blocksConfinedSpace: boolean;
            blocksHotWork: boolean;
            blocksEquipment: boolean;
            startsAt: string;
            expiresAt: string | null;
            active: boolean;
        }[];
    }>;
}
export {};
