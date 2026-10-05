import { SafetyFormStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SafetyFormWorkflowsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assertTransition(from: SafetyFormStatus, to: SafetyFormStatus): void;
    transition(formId: string, to: SafetyFormStatus, actorId?: number, note?: string): Promise<{
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDefinition(): {
        statuses: string[];
        transitions: Record<string, string[]>;
    };
}
