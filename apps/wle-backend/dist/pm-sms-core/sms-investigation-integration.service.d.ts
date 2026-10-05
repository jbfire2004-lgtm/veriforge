import { PmSclState, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RcaEngine } from '../pm-safety-events/rca.engine';
import { SmsEnergyWheelService, type EnergyWheelEntry } from './sms-energy-wheel.service';
import { SmsRiskContextService } from './sms-risk-context.service';
import { SmsNotificationRouterService } from './sms-notification-router.service';
export declare class SmsInvestigationIntegrationService {
    private readonly prisma;
    private readonly rca;
    private readonly energyWheel;
    private readonly riskContext;
    private readonly notify?;
    constructor(prisma: PrismaService, rca: RcaEngine, energyWheel: SmsEnergyWheelService, riskContext: SmsRiskContextService, notify?: SmsNotificationRouterService);
    classifyScl(eventId: string, input: {
        sclState: PmSclState;
        triggers?: string[];
        precursors?: string[];
        potentialSeverity?: string;
        actorId?: number;
    }): Promise<{
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
    saveEnergyWheel(eventId: string, entries: EnergyWheelEntry[]): Promise<{
        entries: EnergyWheelEntry[];
        highEnergy: boolean;
        uncontrolledCount: number;
        systemicGaps: string[];
        suggestedControls: string[];
    }>;
    saveHecaVerification(eventId: string, input: {
        hecaInvolved: boolean;
        hecaCategoryCode?: string;
        verificationAnswers: Record<string, string | boolean>;
        signOffUserId?: number;
    }): Promise<{
        id: string;
        eventId: string;
        status: import(".prisma/client").$Enums.PmInvestigationStatus;
        currentStep: number;
        narrative: string | null;
        immediateActions: string | null;
        guidedAnswersJson: Prisma.JsonValue;
        causalTreeJson: Prisma.JsonValue;
        sclClassificationJson: Prisma.JsonValue;
        hecaVerificationJson: Prisma.JsonValue;
        energyWheelJson: Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    guidedQuestionsWithSms(eventId: string): Promise<{
        eventType: import(".prisma/client").$Enums.PmSafetyEventType;
        sclState: import(".prisma/client").$Enums.PmSclState;
        hecaCategoryCode: string;
        pathways: {
            key: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
            label: string;
            description: string;
        }[];
        questions: any[];
        energyCatalog: {
            energyTypes: {
                type: import(".prisma/client").PmUnifiedEnergyType;
                label: string;
                defaultHighEnergy: boolean;
            }[];
            controlStates: import(".prisma/client").PmEnergyControlState[];
        };
    }>;
}
