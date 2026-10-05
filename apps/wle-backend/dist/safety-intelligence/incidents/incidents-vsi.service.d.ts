import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import type { BulkIncidentCapaDto, OpenIncidentInvestigationDto, UpdateIncidentInvestigationDto } from '../dto/incident-investigation.dto';
import type { CailActor } from '../cail/cail-scope.service';
export declare class IncidentsVsiService {
    private readonly prisma;
    private readonly emitter;
    private readonly ai;
    private readonly copilotEnrich;
    constructor(prisma: PrismaService, emitter: CailEmitterService, ai: SafetyIntelligenceAiService, copilotEnrich: CailCopilotEnrichmentService);
    openInvestigation(incidentId: number, dto: OpenIncidentInvestigationDto, actor: CailActor): Promise<{
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: Prisma.JsonValue;
        aiInvestigationPack: Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInvestigation(incidentId: number): Promise<{
        incident: {
            id: number;
            status: string;
            title: string;
            severity: string;
        };
        project: {
            id: number;
            name: string;
        };
    } & {
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: Prisma.JsonValue;
        aiInvestigationPack: Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateInvestigation(incidentId: number, dto: UpdateIncidentInvestigationDto): Promise<{
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: Prisma.JsonValue;
        aiInvestigationPack: Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateAiPack(incidentId: number): Promise<{
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: Prisma.JsonValue;
        aiInvestigationPack: Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    bulkCreateCapa(incidentId: number, dto: BulkIncidentCapaDto, actor: CailActor): Promise<any[]>;
    listCailForIncident(incidentId: number): Promise<{
        id: string;
        projectId: number;
        ownerCompanyId: number;
        assignedUserId: number | null;
        sourceType: import(".prisma/client").$Enums.CailSourceType;
        sourceId: string;
        sourceItemId: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.CailStatus;
        severity: import(".prisma/client").$Enums.CailSeverity;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        closedAt: Date | null;
        verifiedAt: Date | null;
        createdByUserId: number | null;
        verifiedByUserId: number | null;
        evidenceBefore: Prisma.JsonValue;
        evidenceAfter: Prisma.JsonValue;
        rootCauseCategory: string | null;
        rootCauseNotes: string | null;
        aiRootCauseSuggestions: Prisma.JsonValue | null;
        aiCorrectiveActionSuggestions: Prisma.JsonValue | null;
        aiClassification: Prisma.JsonValue | null;
        lessonsLearnedGenerated: boolean;
        tags: Prisma.JsonValue;
        siteId: number | null;
        locationNote: string | null;
        equipmentId: number | null;
        workerId: number | null;
        overdueAt: Date | null;
        timeToResolveHours: number | null;
    }[]>;
    listIncidents(filters: {
        companyId?: number;
        siteId?: number;
        status?: string;
        limit?: number;
    }): Promise<{
        hasInvestigation: boolean;
        projectId: number;
        id: number;
        companyId: number;
        createdAt: Date;
        status: string;
        siteId: number;
        title: string;
        category: string;
        severity: string;
        vsiInvestigation: {
            projectId: number;
            investigationStatus: string;
        };
    }[]>;
}
