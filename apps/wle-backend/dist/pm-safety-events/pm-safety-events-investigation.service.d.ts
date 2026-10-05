import { PmInvestigationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RcaEngine } from './rca.engine';
import { PmInvestigationCapaIntegrationService } from './pm-investigation-capa-integration.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';
import { SmsInvestigationIntegrationService } from '../pm-sms-core/sms-investigation-integration.service';
export declare class PmSafetyEventsInvestigationService {
    private readonly prisma;
    private readonly rca;
    private readonly capaIntegration?;
    private readonly ecosystem?;
    private readonly smsInvestigation?;
    constructor(prisma: PrismaService, rca: RcaEngine, capaIntegration?: PmInvestigationCapaIntegrationService, ecosystem?: SafetyEcosystemEventsService, smsInvestigation?: SmsInvestigationIntegrationService);
    getOrCreate(eventId: string, leadInvestigatorId?: number): Promise<{
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
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
    update(eventId: string, data: {
        status?: PmInvestigationStatus;
        currentStep?: number;
        narrative?: string;
        immediateActions?: string;
        executiveSummary?: string;
        guidedAnswersJson?: Record<string, unknown>;
        leadInvestigatorId?: number;
    }): Promise<{
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
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
    guidedQuestions(eventId: string): Promise<{
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
    } | {
        eventType: import(".prisma/client").$Enums.PmSafetyEventType;
        currentStep: number;
        pathways: {
            key: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
            label: string;
            description: string;
        }[];
        questions: import("./rca.engine").GuidedQuestion[];
        suggestedContributingFactors: {
            label: string;
            pathway: import("./rca.engine").TaprootPathway;
            confidence: number;
        }[];
    }>;
    saveGuidedAnswers(eventId: string, answers: Record<string, string>, actorId?: number): Promise<{
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
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
    regenerateCausalTree(eventId: string): Promise<{
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
    getCausalTree(eventId: string): Promise<Prisma.JsonValue>;
    suggestFactorsAndRca(eventId: string): Promise<{
        pathways: {
            key: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
            label: string;
            description: string;
        }[];
        rootCauseSuggestions: any[];
        contributingFactors: {
            label: string;
            pathway: import("./rca.engine").TaprootPathway;
            confidence: number;
        }[];
    }>;
}
