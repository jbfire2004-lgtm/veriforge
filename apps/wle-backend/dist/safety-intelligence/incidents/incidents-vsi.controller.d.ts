import { UserRole } from '@prisma/client';
import { CailScopeService } from '../cail/cail-scope.service';
import { IncidentsVsiService } from './incidents-vsi.service';
import { BulkIncidentCapaDto, OpenIncidentInvestigationDto, UpdateIncidentInvestigationDto } from '../dto/incident-investigation.dto';
export declare class IncidentsVsiController {
    private readonly incidents;
    private readonly scope;
    constructor(incidents: IncidentsVsiService, scope: CailScopeService);
    list(companyId?: string, siteId?: string, status?: string): Promise<{
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
    open(id: string, dto: OpenIncidentInvestigationDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: import(".prisma/client").Prisma.JsonValue;
        aiInvestigationPack: import(".prisma/client").Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInvestigation(id: string): Promise<{
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
        witnessStatements: import(".prisma/client").Prisma.JsonValue;
        aiInvestigationPack: import(".prisma/client").Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateIncidentInvestigationDto): Promise<{
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: import(".prisma/client").Prisma.JsonValue;
        aiInvestigationPack: import(".prisma/client").Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    aiPack(id: string): Promise<{
        incidentId: number;
        projectId: number;
        investigationStatus: string;
        narrative: string | null;
        immediateActions: string | null;
        witnessStatements: import(".prisma/client").Prisma.JsonValue;
        aiInvestigationPack: import(".prisma/client").Prisma.JsonValue | null;
        leadInvestigatorId: number | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    bulkCapa(id: string, dto: BulkIncidentCapaDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<any[]>;
    listCail(id: string): Promise<{
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
        evidenceBefore: import(".prisma/client").Prisma.JsonValue;
        evidenceAfter: import(".prisma/client").Prisma.JsonValue;
        rootCauseCategory: string | null;
        rootCauseNotes: string | null;
        aiRootCauseSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        aiCorrectiveActionSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        aiClassification: import(".prisma/client").Prisma.JsonValue | null;
        lessonsLearnedGenerated: boolean;
        tags: import(".prisma/client").Prisma.JsonValue;
        siteId: number | null;
        locationNote: string | null;
        equipmentId: number | null;
        workerId: number | null;
        overdueAt: Date | null;
        timeToResolveHours: number | null;
    }[]>;
}
