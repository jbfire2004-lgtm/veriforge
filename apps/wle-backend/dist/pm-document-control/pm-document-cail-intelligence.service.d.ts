import { PrismaService } from '../prisma/prisma.service';
export type CailDocumentInsight = {
    type: string;
    score: number;
    confidence: number;
    title: string;
    explanation: string;
    evidence: string[];
    suggestedActions: string[];
    links: Array<{
        module: string;
        id: string;
    }>;
};
export declare class PmDocumentCailIntelligenceService {
    private readonly prisma;
    private readonly hazardEngine;
    constructor(prisma: PrismaService);
    workerSdsCompliance(workerId: number, projectId: number): Promise<{
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
    projectInsights(projectId: number): Promise<CailDocumentInsight[]>;
    suggestSdsForTask(input: {
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
    correlateSdsToModules(sdsId: string): {
        sdsId: string;
        jha: string;
        inspections: string;
        incidents: string;
        correctiveActions: string;
    };
}
