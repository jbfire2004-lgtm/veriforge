import { PrismaService } from '../prisma/prisma.service';
import { RcaEngine } from './rca.engine';
export declare class PmInvestigationReportService {
    private readonly prisma;
    private readonly rca;
    constructor(prisma: PrismaService, rca: RcaEngine);
    buildReport(eventId: string): Promise<{
        eventId: string;
        generatedAt: string;
        executiveSummary: string;
        event: {
            title: string;
            type: import(".prisma/client").$Enums.PmSafetyEventType;
            severity: import(".prisma/client").$Enums.PmSafetyEventSeverity;
            riskScore: number;
            project: string;
            occurredAt: Date;
            status: import(".prisma/client").$Enums.PmSafetyEventStatus;
        };
        rootCauseMap: string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray;
        pathways: {
            key: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
            label: string;
            description: string;
        }[];
        rootCauses: {
            id: string;
            eventId: string;
            method: import(".prisma/client").$Enums.PmRcaMethod;
            category: string | null;
            description: string;
            whyChain: import(".prisma/client").Prisma.JsonValue;
            fishboneJson: import(".prisma/client").Prisma.JsonValue;
            taprootJson: import(".prisma/client").Prisma.JsonValue;
            libraryCode: string | null;
            verified: boolean;
            createdAt: Date;
        }[];
        contributingFactors: {
            id: string;
            eventId: string;
            libraryCode: string | null;
            label: string;
            category: string | null;
            notes: string | null;
        }[];
        correctiveActions: {
            id: string;
            eventId: string;
            rootCauseId: string | null;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            unifiedCorrectiveActionId: string | null;
            subcontractorCompanyId: number | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        }[];
        evidence: {
            attachments: number;
            witnesses: number;
            statements: number;
            injuries: number;
        };
        html: string;
    }>;
    private buildExecutiveSummary;
    private renderPrintableHtml;
}
