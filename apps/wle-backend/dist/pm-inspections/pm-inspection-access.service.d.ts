import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SecurityActor } from '../security/security.types';
import { PmInspectionSubcontractorResolverService } from './pm-inspection-subcontractor-resolver.service';
export declare class PmInspectionAccessService {
    private readonly prisma;
    private readonly subcontractorResolver;
    constructor(prisma: PrismaService, subcontractorResolver: PmInspectionSubcontractorResolverService);
    isProjectOwnerRole(role: UserRole): boolean;
    loadInspectionContext(inspectionId: string): Promise<{
        sharing: import("./pm-inspection-sharing.types").InspectionSharingConfig;
        project: {
            companyId: number;
            name: string;
        };
        id: string;
        companyId: number;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        projectId: number;
        inspectorUserId: number;
        sharingJson: import(".prisma/client").Prisma.JsonValue;
    }>;
    actorCompanyOnProject(actor: SecurityActor, projectId: number): Promise<boolean>;
    actorWorkerOnProject(actor: SecurityActor, projectId: number): Promise<boolean>;
    canViewInspectionReport(actor: SecurityActor, inspectionId: string): Promise<boolean>;
    assertCanViewInspectionReport(actor: SecurityActor, inspectionId: string): Promise<void>;
    assertCanManageInspectionSharing(actor: SecurityActor, inspectionId: string): Promise<void>;
    canViewProjectFindingsLog(actor: SecurityActor, projectId: number): Promise<boolean>;
    assertCanViewProjectFindingsLog(actor: SecurityActor, projectId: number): Promise<void>;
}
