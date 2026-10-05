import { PmControlledDocumentType, PmDocumentStatus, PmSdsCategory } from '@prisma/client';
import { PmDocumentControlService } from './pm-document-control.service';
import { PmDocumentCailIntelligenceService } from './pm-document-cail-intelligence.service';
export declare class PmDocumentControlController {
    private readonly docs;
    private readonly cail;
    constructor(docs: PmDocumentControlService, cail: PmDocumentCailIntelligenceService);
    listSds(companyId: string, projectId?: string, category?: PmSdsCategory, status?: PmDocumentStatus, search?: string): import(".prisma/client").Prisma.PrismaPromise<({
        attachments: {
            id: string;
            sdsDocumentId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        productName: string;
        manufacturer: string | null;
        category: import(".prisma/client").$Enums.PmSdsCategory;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        version: number;
        parentDocumentId: string | null;
        casNumbers: import(".prisma/client").Prisma.JsonValue;
        hazardClasses: import(".prisma/client").Prisma.JsonValue;
        whmisJson: import(".prisma/client").Prisma.JsonValue;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        storageKey: string | null;
        revisionDate: Date | null;
        expiresAt: Date | null;
        reviewDueAt: Date | null;
        requiresAck: boolean;
        publishedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createSds(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        productName: string;
        manufacturer: string | null;
        category: import(".prisma/client").$Enums.PmSdsCategory;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        version: number;
        parentDocumentId: string | null;
        casNumbers: import(".prisma/client").Prisma.JsonValue;
        hazardClasses: import(".prisma/client").Prisma.JsonValue;
        whmisJson: import(".prisma/client").Prisma.JsonValue;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        storageKey: string | null;
        revisionDate: Date | null;
        expiresAt: Date | null;
        reviewDueAt: Date | null;
        requiresAck: boolean;
        publishedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSds(id: string): Promise<{
        lifecycleStatus: "active" | "expired" | "superseded";
        extractedHazards: string[];
        extractedControls: string[];
        ppeRequirements: string[];
        attachments: {
            id: string;
            sdsDocumentId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        versions: {
            id: string;
            sdsDocumentId: string;
            version: number;
            snapshot: import(".prisma/client").Prisma.JsonValue;
            authorId: number | null;
            createdAt: Date;
        }[];
        acknowledgments: {
            id: string;
            workerId: number;
            sdsDocumentId: string | null;
            controlledDocumentId: string | null;
            policyDocumentId: string | null;
            acknowledgedAt: Date;
            signatureData: string | null;
            clientSyncId: string | null;
        }[];
        inventory: ({
            site: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number;
            sdsDocumentId: string | null;
            productName: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal | null;
            unit: string | null;
            containerSize: string | null;
            locationNote: string | null;
            storageClass: string | null;
            incompatibleWith: import(".prisma/client").Prisma.JsonValue;
            chemicalExpiry: Date | null;
            missingSdsFlag: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        id: string;
        companyId: number;
        projectId: number | null;
        productName: string;
        manufacturer: string | null;
        category: import(".prisma/client").$Enums.PmSdsCategory;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        version: number;
        parentDocumentId: string | null;
        casNumbers: import(".prisma/client").Prisma.JsonValue;
        hazardClasses: import(".prisma/client").Prisma.JsonValue;
        whmisJson: import(".prisma/client").Prisma.JsonValue;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        storageKey: string | null;
        revisionDate: Date | null;
        expiresAt: Date | null;
        reviewDueAt: Date | null;
        requiresAck: boolean;
        publishedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    transitionSds(id: string, status: PmDocumentStatus, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        productName: string;
        manufacturer: string | null;
        category: import(".prisma/client").$Enums.PmSdsCategory;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        version: number;
        parentDocumentId: string | null;
        casNumbers: import(".prisma/client").Prisma.JsonValue;
        hazardClasses: import(".prisma/client").Prisma.JsonValue;
        whmisJson: import(".prisma/client").Prisma.JsonValue;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        storageKey: string | null;
        revisionDate: Date | null;
        expiresAt: Date | null;
        reviewDueAt: Date | null;
        requiresAck: boolean;
        publishedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    replaceSds(id: string, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        productName: string;
        manufacturer: string | null;
        category: import(".prisma/client").$Enums.PmSdsCategory;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        version: number;
        parentDocumentId: string | null;
        casNumbers: import(".prisma/client").Prisma.JsonValue;
        hazardClasses: import(".prisma/client").Prisma.JsonValue;
        whmisJson: import(".prisma/client").Prisma.JsonValue;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        storageKey: string | null;
        revisionDate: Date | null;
        expiresAt: Date | null;
        reviewDueAt: Date | null;
        requiresAck: boolean;
        publishedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addSdsAttachment(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        sdsDocumentId: string;
        storageKey: string | null;
        fileName: string | null;
        mimeType: string | null;
        dataUrl: string | null;
        coreFileId: number | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    listInventory(companyId?: string, projectId?: string, siteId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        site: {
            id: number;
            name: string;
        };
        sdsDocument: {
            id: string;
            status: import(".prisma/client").$Enums.PmDocumentStatus;
            expiresAt: Date;
            productName: string;
        };
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number;
        sdsDocumentId: string | null;
        productName: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
        containerSize: string | null;
        locationNote: string | null;
        storageClass: string | null;
        incompatibleWith: import(".prisma/client").Prisma.JsonValue;
        chemicalExpiry: Date | null;
        missingSdsFlag: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    upsertInventory(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number;
        sdsDocumentId: string | null;
        productName: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
        containerSize: string | null;
        locationNote: string | null;
        storageClass: string | null;
        incompatibleWith: import(".prisma/client").Prisma.JsonValue;
        chemicalExpiry: Date | null;
        missingSdsFlag: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    scanDeficiencies(projectId: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        storageIssues: import("./chemical-compatibility.engine").ChemicalStorageIssue[];
        capasCreated: number;
        capas: any[];
    }>;
    listControlled(companyId: string, projectId?: string, documentType?: PmControlledDocumentType, status?: PmDocumentStatus): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        projectId: number | null;
        documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
        title: string;
        description: string | null;
        versionNum: number;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        storageKey: string | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        equipmentId: number | null;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        reviewDueAt: Date | null;
        publishedAt: Date | null;
        supersededById: string | null;
        parentDocumentId: string | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createControlled(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
        title: string;
        description: string | null;
        versionNum: number;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        storageKey: string | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        equipmentId: number | null;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        reviewDueAt: Date | null;
        publishedAt: Date | null;
        supersededById: string | null;
        parentDocumentId: string | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    transitionControlled(id: string, status: PmDocumentStatus, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
        title: string;
        description: string | null;
        versionNum: number;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        storageKey: string | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        equipmentId: number | null;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        reviewDueAt: Date | null;
        publishedAt: Date | null;
        supersededById: string | null;
        parentDocumentId: string | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listPolicies(companyId: string, projectId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        projectId: number | null;
        title: string;
        version: string;
        versionNum: number;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        storageKey: string | null;
        category: string;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        parentDocumentId: string | null;
        reviewDueAt: Date | null;
        publishedAt: Date | null;
        supersededAt: Date | null;
        archivedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    publishPolicy(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        title: string;
        version: string;
        versionNum: number;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        storageKey: string | null;
        category: string;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        parentDocumentId: string | null;
        reviewDueAt: Date | null;
        publishedAt: Date | null;
        supersededAt: Date | null;
        archivedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    acknowledge(body: Record<string, unknown>): Promise<{
        id: string;
        workerId: number;
        sdsDocumentId: string | null;
        controlledDocumentId: string | null;
        policyDocumentId: string | null;
        acknowledgedAt: Date;
        signatureData: string | null;
        clientSyncId: string | null;
    }>;
    listManufacturer(companyId: string, equipmentId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        equipment: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        companyId: number;
        equipmentId: number | null;
        controlledDocId: string | null;
        title: string;
        manufacturer: string | null;
        modelNumber: string | null;
        revisionDate: Date | null;
        outdatedAt: Date | null;
        storageKey: string | null;
        hazardHints: import(".prisma/client").Prisma.JsonValue;
        controlHints: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createManufacturer(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        equipmentId: number | null;
        controlledDocId: string | null;
        title: string;
        manufacturer: string | null;
        modelNumber: string | null;
        revisionDate: Date | null;
        outdatedAt: Date | null;
        storageKey: string | null;
        hazardHints: import(".prisma/client").Prisma.JsonValue;
        controlHints: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suggestControls(equipmentId: string): import(".prisma/client").Prisma.PrismaPromise<{
        title: string;
        hazardHints: import(".prisma/client").Prisma.JsonValue;
        controlHints: import(".prisma/client").Prisma.JsonValue;
    }[]>;
    workerAccess(workerId: string, projectId: string): Promise<{
        allowed: boolean;
        missingPolicyAcks: number;
        missingSdsAcks: number;
    }>;
    analytics(projectId: string): Promise<{
        sdsTotal: number;
        sdsExpiringSoon: number;
        sdsExpired: number;
        inventoryCount: number;
        missingSds: number;
        expiredChemicals: number;
        policiesPublished: number;
        policyAckCompliancePct: number;
        sdsCompliancePct: number;
        controlledDocs: number;
        chemicalHazardTrend: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SdsDocumentGroupByOutputType, "category"[]> & {
            _count: number;
        })[];
        expiryTrends: {
            expiringSoon: number;
            expired: number;
        };
        leadingIndicators: {
            missingSdsRate: number;
            expiredChemicalRate: number;
            sdsCompliancePct: number;
        };
        cailInsights: import("./pm-document-cail-intelligence.service").CailDocumentInsight[];
    }>;
    intelligence(projectId: string): Promise<import("./pm-document-cail-intelligence.service").CailDocumentInsight[]>;
    suggestSds(body: {
        companyId: number;
        projectId?: number;
        taskKeywords: string[];
        equipmentIds?: number[];
    }): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        projectId: number | null;
        productName: string;
        manufacturer: string | null;
        category: import(".prisma/client").$Enums.PmSdsCategory;
        status: import(".prisma/client").$Enums.PmDocumentStatus;
        version: number;
        parentDocumentId: string | null;
        casNumbers: import(".prisma/client").Prisma.JsonValue;
        hazardClasses: import(".prisma/client").Prisma.JsonValue;
        whmisJson: import(".prisma/client").Prisma.JsonValue;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        storageKey: string | null;
        revisionDate: Date | null;
        expiresAt: Date | null;
        reviewDueAt: Date | null;
        requiresAck: boolean;
        publishedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    syncBundle(projectId: string): Promise<{
        syncedAt: string;
        projectId: number;
        sds: ({
            attachments: {
                id: string;
                sdsDocumentId: string;
                storageKey: string | null;
                fileName: string | null;
                mimeType: string | null;
                dataUrl: string | null;
                coreFileId: number | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            productName: string;
            manufacturer: string | null;
            category: import(".prisma/client").$Enums.PmSdsCategory;
            status: import(".prisma/client").$Enums.PmDocumentStatus;
            version: number;
            parentDocumentId: string | null;
            casNumbers: import(".prisma/client").Prisma.JsonValue;
            hazardClasses: import(".prisma/client").Prisma.JsonValue;
            whmisJson: import(".prisma/client").Prisma.JsonValue;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            storageKey: string | null;
            revisionDate: Date | null;
            expiresAt: Date | null;
            reviewDueAt: Date | null;
            requiresAck: boolean;
            publishedAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        inventory: ({
            site: {
                id: number;
                name: string;
            };
            sdsDocument: {
                id: string;
                status: import(".prisma/client").$Enums.PmDocumentStatus;
                expiresAt: Date;
                productName: string;
            };
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number;
            sdsDocumentId: string | null;
            productName: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal | null;
            unit: string | null;
            containerSize: string | null;
            locationNote: string | null;
            storageClass: string | null;
            incompatibleWith: import(".prisma/client").Prisma.JsonValue;
            chemicalExpiry: Date | null;
            missingSdsFlag: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        policies: {
            id: string;
            companyId: number;
            projectId: number | null;
            title: string;
            version: string;
            versionNum: number;
            status: import(".prisma/client").$Enums.PmDocumentStatus;
            storageKey: string | null;
            category: string;
            requiresAck: boolean;
            requiresAckForAccess: boolean;
            parentDocumentId: string | null;
            reviewDueAt: Date | null;
            publishedAt: Date | null;
            supersededAt: Date | null;
            archivedAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        controlled: {
            id: string;
            companyId: number;
            projectId: number | null;
            documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
            title: string;
            description: string | null;
            versionNum: number;
            status: import(".prisma/client").$Enums.PmDocumentStatus;
            storageKey: string | null;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            equipmentId: number | null;
            requiresAck: boolean;
            requiresAckForAccess: boolean;
            reviewDueAt: Date | null;
            publishedAt: Date | null;
            supersededById: string | null;
            parentDocumentId: string | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        manufacturer: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            companyId: number;
            equipmentId: number | null;
            controlledDocId: string | null;
            title: string;
            manufacturer: string | null;
            modelNumber: string | null;
            revisionDate: Date | null;
            outdatedAt: Date | null;
            storageKey: string | null;
            hazardHints: import(".prisma/client").Prisma.JsonValue;
            controlHints: import(".prisma/client").Prisma.JsonValue;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    applySync(projectId: string, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        acks: number;
        sds: number;
    }>;
    stationPayload(companyId: string, siteId?: string): Promise<{
        emergencyPlans: {
            id: string;
            companyId: number;
            projectId: number | null;
            documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
            title: string;
            description: string | null;
            versionNum: number;
            status: import(".prisma/client").$Enums.PmDocumentStatus;
            storageKey: string | null;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            equipmentId: number | null;
            requiresAck: boolean;
            requiresAckForAccess: boolean;
            reviewDueAt: Date | null;
            publishedAt: Date | null;
            supersededById: string | null;
            parentDocumentId: string | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        sds: ({
            attachments: {
                id: string;
                sdsDocumentId: string;
                storageKey: string | null;
                fileName: string | null;
                mimeType: string | null;
                dataUrl: string | null;
                coreFileId: number | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            productName: string;
            manufacturer: string | null;
            category: import(".prisma/client").$Enums.PmSdsCategory;
            status: import(".prisma/client").$Enums.PmDocumentStatus;
            version: number;
            parentDocumentId: string | null;
            casNumbers: import(".prisma/client").Prisma.JsonValue;
            hazardClasses: import(".prisma/client").Prisma.JsonValue;
            whmisJson: import(".prisma/client").Prisma.JsonValue;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            storageKey: string | null;
            revisionDate: Date | null;
            expiresAt: Date | null;
            reviewDueAt: Date | null;
            requiresAck: boolean;
            publishedAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        siteId: number;
        generatedAt: string;
    }>;
}
