import { UserRole } from '@prisma/client';
import { CailScopeService } from '../cail/cail-scope.service';
import { BboService } from './bbo.service';
import { CreateBboDto } from '../dto/create-bbo.dto';
export declare class BboController {
    private readonly bbo;
    private readonly scope;
    constructor(bbo: BboService, scope: CailScopeService);
    list(req: {
        user: {
            id: number;
            role: UserRole;
        };
    }, projectId?: string, polarity?: string, behaviorCategory?: string): Promise<({
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
        antecedents: import(".prisma/client").Prisma.JsonValue | null;
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
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
        observedAt: Date;
        createdAt: Date;
    })[]>;
    metrics(projectId: string): Promise<{
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
    create(dto: CreateBboDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
        antecedents: import(".prisma/client").Prisma.JsonValue | null;
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
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
        observedAt: Date;
        createdAt: Date;
    }>;
}
