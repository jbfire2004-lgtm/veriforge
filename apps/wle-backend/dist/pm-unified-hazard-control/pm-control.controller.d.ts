import { PmUnifiedHazardControlService } from './pm-unified-hazard-control.service';
export declare class PmControlController {
    private readonly hc;
    constructor(hc: PmUnifiedHazardControlService);
    createControl(body: {
        companyId: number;
    } & Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        verifications: {
            id: string;
            controlId: string;
            stepOrder: number;
            description: string;
            verifiedAt: Date | null;
            verifiedById: number | null;
        }[];
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        parentControlId: string | null;
        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
        controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
        title: string;
        description: string;
        controlStrength: number;
        hierarchyLevel: number;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
        sourceId: string | null;
        legacyCompanyControlId: string | null;
        legacyProjectControlId: string | null;
        version: number;
        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
        publishedAt: Date | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getControl(id: string): Promise<{
        versions: {
            id: string;
            controlId: string;
            version: number;
            snapshotJson: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date;
        }[];
        verifications: {
            id: string;
            controlId: string;
            stepOrder: number;
            description: string;
            verifiedAt: Date | null;
            verifiedById: number | null;
        }[];
        trainingReqs: {
            id: string;
            controlId: string;
            trainingCode: string;
            required: boolean;
        }[];
        ppeReqs: {
            id: string;
            controlId: string;
            ppeType: string;
        }[];
        hazardLinks: ({
            hazard: {
                id: string;
                companyId: number;
                projectId: number | null;
                workPackageId: string | null;
                taskId: string | null;
                workerId: number | null;
                parentHazardId: string | null;
                scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
                category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
                subcategory: string | null;
                title: string;
                description: string;
                severity: number;
                likelihood: number;
                riskScore: number;
                sifPotential: boolean;
                hecaCategoryKey: string | null;
                sifScore: number | null;
                supervisorReviewRequired: boolean;
                requiredTraining: import(".prisma/client").Prisma.JsonValue;
                requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                requiredPpe: import(".prisma/client").Prisma.JsonValue;
                requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
                sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                sourceId: string | null;
                legacyCompanyHazardId: string | null;
                legacyProjectHazardId: string | null;
                version: number;
                status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                publishedAt: Date | null;
                active: boolean;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            hazardId: string;
            controlId: string;
            effectivenessScore: number | null;
            required: boolean;
            verified: boolean;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        parentControlId: string | null;
        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
        controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
        title: string;
        description: string;
        controlStrength: number;
        hierarchyLevel: number;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
        sourceId: string | null;
        legacyCompanyControlId: string | null;
        legacyProjectControlId: string | null;
        version: number;
        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
        publishedAt: Date | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publish(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        parentControlId: string | null;
        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
        controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
        title: string;
        description: string;
        controlStrength: number;
        hierarchyLevel: number;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
        sourceId: string | null;
        legacyCompanyControlId: string | null;
        legacyProjectControlId: string | null;
        version: number;
        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
        publishedAt: Date | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
