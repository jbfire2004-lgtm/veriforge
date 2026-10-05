import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import { EventClassificationEngine } from './event-classification.engine';
export declare class PmSafetyEventsIngestionService {
    private readonly prisma;
    private readonly classifier;
    private readonly sifHeca?;
    constructor(prisma: PrismaService, classifier: EventClassificationEngine, sifHeca?: SifHecaService);
    ingestToSifHeca(eventId: string, actorId?: number): Promise<{
        sifScore: {
            id: string;
            eventId: string;
            version: number;
            sifScore: number;
            sifCategory: import(".prisma/client").$Enums.SifPotentialCategory;
            severityComponent: number;
            likelihoodComponent: number;
            energyComponent: number;
            controlComponent: number;
            competencyComponent: number;
            equipmentComponent: number;
            environmentComponent: number;
            historyComponent: number;
            requiresSupervisorReview: boolean;
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        hecaScore: {
            id: string;
            eventId: string;
            version: number;
            hecaCategoryCode: string;
            hecaCategoryLabel: string;
            severity: number;
            likelihood: number;
            hecaRiskScore: number;
            highEnergyFlag: boolean;
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        correctiveActions: {
            id: string;
            eventId: string;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            linkedActionId: string | null;
            correctiveActionId: string | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        sourceType: import(".prisma/client").$Enums.SifHecaSourceType;
        sourceId: string;
        sourceItemId: string;
        status: import(".prisma/client").$Enums.SifHecaEventStatus;
        title: string;
        description: string | null;
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
