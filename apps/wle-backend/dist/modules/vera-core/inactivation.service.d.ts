import { PrismaService } from '../../prisma/prisma.service';
export type WorkerInactivationReason = 'END_ASSIGNMENT' | 'REMOVED_FROM_PROJECT' | 'UNION_RECALL' | 'PROJECT_CLOSED' | 'NEW_COMPANY_LINK';
export type EquipmentInactivationReason = 'END_ASSIGNMENT' | 'REMOVED_FROM_PROJECT' | 'INSPECTION_FAILED' | 'PROJECT_CLOSED' | 'NEW_COMPANY_LINK';
export declare class InactivationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    deactivateWorkerAtCompany(workerId: number, companyId: number, reason: WorkerInactivationReason): Promise<{
        workerId: number;
        companyId: number;
        reason: WorkerInactivationReason;
        deactivatedAt: Date;
    }>;
    deactivateEquipmentAtCompany(equipmentId: number, companyId: number, reason: EquipmentInactivationReason): Promise<{
        equipmentId: number;
        companyId: number;
        reason: EquipmentInactivationReason;
        deactivatedAt: Date;
    }>;
    closeProject(projectId: number): Promise<{
        id: number;
        companyId: number;
        siteId: number | null;
        name: string;
        code: string | null;
        client: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
    }>;
    lockoutEquipment(equipmentId: number, reason: string): Promise<{
        equipmentId: number;
        lockedOutAt: Date;
        reason: string;
    }>;
}
