import { PmDocumentControlService } from './pm-document-control.service';
import { PmDocumentCailIntelligenceService } from './pm-document-cail-intelligence.service';
export declare class PmSdsController {
    private readonly docs;
    private readonly cail;
    constructor(docs: PmDocumentControlService, cail: PmDocumentCailIntelligenceService);
    offlineSync(body: {
        projectId: number;
        acknowledgments?: Array<Record<string, unknown>>;
        sdsCreates?: Array<Record<string, unknown>>;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        acks: number;
        sds: number;
    }>;
    workerCompliance(workerId: string, projectId: string): Promise<{
        workerId: number;
        complianceScore: number;
        missingAcks: string[];
        projectId?: undefined;
        predictiveChemicalRisk?: undefined;
        recommendedAcknowledgments?: undefined;
    } | {
        workerId: number;
        projectId: number;
        complianceScore: number;
        missingAcks: string[];
        predictiveChemicalRisk: number;
        recommendedAcknowledgments: {
            action: string;
            priority: string;
        }[];
    }>;
    workerSds(workerId: string, projectId?: string): Promise<{
        workerId: number;
        projectId: number;
        documents: {
            id: string;
            productName: string;
            manufacturer: string;
            lifecycleStatus: "active" | "expired" | "superseded";
            requiresAck: boolean;
            acknowledged: boolean;
            acknowledgedAt: Date;
            expiresAt: Date;
            accessBlocked: boolean;
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
        sdsComplianceScore: number;
        access: {
            allowed: boolean;
            missingPolicyAcks: number;
            missingSdsAcks: number;
        };
    }>;
    create(body: Record<string, unknown>, req: {
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
    extractHazards(id: string): Promise<{
        suggestedControls: string[];
        hazards: string[];
        controls: string[];
        ppeRequirements: string[];
        firstAid: Record<string, unknown>;
        handlingStorage: Record<string, unknown>;
        whmisClassification: Record<string, unknown>;
        chemicalRiskScore: number;
        sdsId: string;
    }>;
    score(id: string): Promise<{
        sdsId: string;
        lifecycleStatus: "active" | "expired" | "superseded";
        chemicalRiskScore: number;
        hazardCount: number;
        requiresAck: boolean;
        expiresAt: Date;
    }>;
    acknowledge(id: string, body: {
        workerId: number;
        signatureData?: string;
        deviceId?: string;
        clientSyncId?: string;
    }): Promise<{
        id: string;
        workerId: number;
        sdsDocumentId: string | null;
        controlledDocumentId: string | null;
        policyDocumentId: string | null;
        acknowledgedAt: Date;
        signatureData: string | null;
        clientSyncId: string | null;
    }>;
    get(id: string): Promise<{
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
}
