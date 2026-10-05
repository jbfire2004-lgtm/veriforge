import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import type { CreateBboDto } from '../dto/create-bbo.dto';
export declare class BboService {
    private readonly prisma;
    private readonly emitter;
    private readonly scope;
    private readonly copilotEnrich;
    constructor(prisma: PrismaService, emitter: CailEmitterService, scope: CailScopeService, copilotEnrich: CailCopilotEnrichmentService);
    list(actor: CailActor, filters: {
        projectId?: number;
        polarity?: string;
        behaviorCategory?: string;
    }): Promise<({
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
        };
        observedBy: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        projectId: number;
        observedByUserId: number;
        observerCompanyId: number | null;
        polarity: import(".prisma/client").$Enums.ObservationPolarity;
        behaviorDescription: string;
        locationNote: string | null;
        workActivity: string | null;
        workersObservedCount: number | null;
        behaviorCategory: import(".prisma/client").$Enums.BboBehaviorCategory | null;
        safeBehaviors: string | null;
        atRiskBehaviors: string | null;
        antecedents: Prisma.JsonValue | null;
        feedbackGiven: boolean;
        feedbackNotes: string | null;
        workerResponse: string | null;
        actionAgreed: string | null;
        actionOwnerUserId: number | null;
        actionDueAt: Date | null;
        steeringEscalate: boolean;
        siteId: number | null;
        equipmentId: number | null;
        workerId: number | null;
        ownerCompanyId: number | null;
        assignedUserId: number | null;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        cailEntryId: string | null;
        aiAnalysis: Prisma.JsonValue | null;
        observedAt: Date;
        createdAt: Date;
    })[]>;
    create(dto: CreateBboDto, actor: CailActor): Promise<{
        id: string;
        projectId: number;
        observedByUserId: number;
        observerCompanyId: number | null;
        polarity: import(".prisma/client").$Enums.ObservationPolarity;
        behaviorDescription: string;
        locationNote: string | null;
        workActivity: string | null;
        workersObservedCount: number | null;
        behaviorCategory: import(".prisma/client").$Enums.BboBehaviorCategory | null;
        safeBehaviors: string | null;
        atRiskBehaviors: string | null;
        antecedents: Prisma.JsonValue | null;
        feedbackGiven: boolean;
        feedbackNotes: string | null;
        workerResponse: string | null;
        actionAgreed: string | null;
        actionOwnerUserId: number | null;
        actionDueAt: Date | null;
        steeringEscalate: boolean;
        siteId: number | null;
        equipmentId: number | null;
        workerId: number | null;
        ownerCompanyId: number | null;
        assignedUserId: number | null;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        cailEntryId: string | null;
        aiAnalysis: Prisma.JsonValue | null;
        observedAt: Date;
        createdAt: Date;
    }>;
    getMetrics(projectId: number): Promise<{
        projectId: number;
        total: number;
        safe: number;
        atRisk: number;
        positiveRatio: number;
        atRiskByCategory: {
            category: import(".prisma/client").$Enums.BboBehaviorCategory;
            count: number;
        }[];
    }>;
}
