import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type PortalActor = {
    userId: number;
    role: UserRole;
    companyId: number | null;
};
export declare const CONTRACTOR_ROLES: UserRole[];
export declare const PRIME_PORTAL_ROLES: UserRole[];
export declare class PmContractorPortalAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    isContractorRole(role: UserRole): boolean;
    requireContractorCompany(actor: PortalActor): number;
    assertContractorAccess(actor: PortalActor, contractorCompanyId?: number): Promise<number>;
    assertMembership(primeCompanyId: number, contractorCompanyId: number, projectId?: number): Promise<{
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        active: boolean;
        createdAt: Date;
    }>;
    listMembershipsForContractor(contractorCompanyId: number): Promise<({
        project: {
            id: number;
            name: string;
        };
        primeCompany: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        active: boolean;
        createdAt: Date;
    })[]>;
    listMembershipsForPrime(primeCompanyId: number, projectId?: number): Promise<({
        project: {
            id: number;
            name: string;
        };
        contractorCompany: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        active: boolean;
        createdAt: Date;
    })[]>;
    ensureMembership(primeCompanyId: number, contractorCompanyId: number, projectId?: number): Promise<any>;
    private syncSubcontractorOnProject;
    getContractorWorkerIds(contractorCompanyId: number): Promise<number[]>;
    assertDispatchAccess(actor: PortalActor, dispatchId: string): Promise<{
        correctiveAction: {
            id: string;
            companyId: number;
            projectId: number;
            title: string;
            subcontractorCompanyId: number;
        };
    } & {
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assertCorrectiveActionAccess(actor: PortalActor, actionId: string): Promise<{
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
