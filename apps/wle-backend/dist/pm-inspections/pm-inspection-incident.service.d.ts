import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyEventsService } from '../pm-safety-events/pm-safety-events.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
export type InspectionIncidentDraftResult = {
    inspectionId: string;
    eventId: string;
    existing: boolean;
    event: unknown;
};
export declare class PmInspectionIncidentService {
    private readonly prisma;
    private readonly safetyEvents?;
    private readonly eventBus?;
    constructor(prisma: PrismaService, safetyEvents?: PmSafetyEventsService, eventBus?: EventBusService);
    hasCriticalMarkedFailedItems(inspectionId: string): Promise<boolean>;
    findExistingIncident(inspectionId: string): Promise<{
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        eventType: import(".prisma/client").$Enums.PmSafetyEventType;
        customTypeCode: string | null;
        status: import(".prisma/client").$Enums.PmSafetyEventStatus;
        severity: import(".prisma/client").$Enums.PmSafetyEventSeverity;
        likelihood: number;
        riskScore: number;
        sifEventId: string | null;
        hecaCategoryCode: string | null;
        sclState: import(".prisma/client").$Enums.PmSclState | null;
        sclTriggersJson: Prisma.JsonValue;
        sclPrecursorsJson: Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: Prisma.JsonValue;
        propertyDamageJson: Prisma.JsonValue;
        environmentalImpactJson: Prisma.JsonValue;
        dangerousOccurrenceJson: Prisma.JsonValue;
        intakeWizardStep: number;
        requiresSupervisorReview: boolean;
        reviewNotes: string | null;
        reviewedByUserId: number | null;
        reviewedAt: Date | null;
        submittedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        legacyIncidentId: number | null;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDraftIncidentFromInspection(inspection: Prisma.PmInspectionGetPayload<{
        include: {
            template: true;
            deficiencies: true;
        };
    }> & {
        equipmentId?: number | null;
        workerId?: number | null;
    }, actorId: number, options?: {
        title?: string;
        description?: string;
        auto?: boolean;
    }): Promise<InspectionIncidentDraftResult>;
    createDraftIfCriticalOnSubmit(inspectionId: string, actorId: number): Promise<InspectionIncidentDraftResult | null>;
}
