import { SafetyFormType, UserRole } from '@prisma/client';
import { SafetyWorkflowEngineService } from './workflows/safety-workflow-engine.service';
type AuthReq = {
    user?: {
        id: number;
        role: UserRole;
    };
};
export declare class ProjectSafetyController {
    private readonly engine;
    constructor(engine: SafetyWorkflowEngineService);
    listProjectForms(projectId: number, formType?: SafetyFormType, workerId?: string, awaitingReview?: string): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        project: {
            id: number;
            name: string;
        };
        formDefinition: {
            id: string;
            name: string;
            category: string;
        };
    } & {
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
    })[]>;
    createProjectForm(projectId: number, body: {
        formType: SafetyFormType;
        workerId?: number;
        companyId?: number;
        title?: string;
        formData?: Record<string, unknown>;
    }, req: AuthReq): Promise<{
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
}
export {};
