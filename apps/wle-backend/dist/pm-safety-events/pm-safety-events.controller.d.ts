import { PmSafetyEventStatus, PmSafetyEventType } from '@prisma/client';
import { PmSafetyEventsService } from './pm-safety-events.service';
import { PmSafetyEventsLibraryService } from './pm-safety-events-library.service';
import { PmSafetyEventsIntelligenceService } from './pm-safety-events-intelligence.service';
import { PmSafetyEventsInvestigationService } from './pm-safety-events-investigation.service';
import { PmInvestigationReportService } from './pm-investigation-report.service';
import { IncidentSifEngineService } from './incident-sif-engine.service';
import type { IncidentSifEngineInput } from './incident-sif-engine.types';
export declare class PmSafetyEventsController {
    private readonly events;
    private readonly library;
    private readonly intelligence;
    private readonly investigation;
    private readonly report;
    private readonly incidentEngine;
    constructor(events: PmSafetyEventsService, library: PmSafetyEventsLibraryService, intelligence: PmSafetyEventsIntelligenceService, investigation: PmSafetyEventsInvestigationService, report: PmInvestigationReportService, incidentEngine: IncidentSifEngineService);
    generateIncidentEngine(body: IncidentSifEngineInput): import("./incident-sif-engine.types").IncidentSifEngineOutput;
    rootCauses(companyId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        code: string;
        label: string;
        category: string | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    contributingFactors(companyId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        code: string;
        label: string;
        category: string | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    seedLibrary(companyId: string): Promise<void>;
    list(projectId?: string, companyId?: string, status?: PmSafetyEventStatus, eventType?: PmSafetyEventType): Promise<({
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    })[]>;
    analytics(projectId: string): Promise<{
        totalEvents: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
        rootCauseDistribution: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmSafetyEventRootCauseGroupByOutputType, "category"[]> & {
            _count: number;
        })[];
        nearMissTrend: number;
        injuryCount: number;
        projectIncidentScore: number;
        complianceLeadingIndicator: number;
        trends: {
            events90d: number;
            injuryRate90d: number;
        };
        workerInvolvementByRole: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmSafetyEventPersonGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        equipmentInvolvementCount: number;
        sifHecaLinkedCount: number;
        hecaCategoryTrend: Record<string, number>;
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    workerAccess(workerId: string, projectId: string): Promise<{
        allowed: boolean;
        criticalEventsWithoutClearance: number;
        openCorrectiveActions: number;
    }>;
    sync(req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    evaluateOhs(body: {
        text?: string;
        title?: string;
        description?: string;
        regionCode?: string;
    }): import("../verisuite-sms/services/dangerous-occurrence.engine").DangerousOccurrenceAssessment;
    syncOfflineAlias(req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    generateIncidentEngineFromEvent(id: string): Promise<import("./incident-sif-engine.types").IncidentSifEngineOutput>;
    score(id: string): Promise<{
        source: string;
        sifEventId: string;
        sif_score: number;
        sif_category: import(".prisma/client").$Enums.SifPotentialCategory;
        heca_category: string;
        heca_category_label: string;
        risk_score: number;
        requires_supervisor_review: boolean;
    } | {
        risk_score: number;
        sif_score: number;
        sif_category: "medium" | "low" | "high" | "critical";
        heca_category: string;
        heca_category_label: string;
        heca_risk_score: number;
        high_energy_flag: boolean;
        requires_supervisor_review: boolean;
        required_controls: string[];
        required_corrective_actions: string[];
        explainability: {
            sif: {
                rule: string;
                points: number;
                detail: string;
            }[];
            heca: {
                rule: string;
                detail: string;
            }[];
            csra: {
                rule: string;
                detail: string;
            }[];
        };
        control_findings: string[];
        csra: import("../sif-heca/csra-heca.engine").CsraAssessmentOutput;
        source: string;
        sifEventId: any;
    } | {
        source: string;
        sif_score: any;
        heca_category: string;
        risk_score: number;
        requires_supervisor_review: boolean;
        sifEventId?: undefined;
        sif_category?: undefined;
        heca_category_label?: undefined;
    }>;
    predict(id: string): Promise<{
        sif_score: any;
        heca_category: string;
        root_cause_suggestions: any[];
        recommended_corrective_actions: {
            title: string;
            priority: string;
        }[];
        predictive_recurrence_likelihood: number;
        worker_risk_impacts: {
            workerId: number;
            eventsInvolved: number;
            injuryRecords: number;
            riskScore: number;
        }[];
        equipment_risk_impact: {
            equipmentInvolved: number;
            lockoutsApplied: number;
        };
        requires_safety_review: boolean;
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    timeline(id: string): Promise<{
        id: string;
        incidentId: string;
        timestamp: unknown;
        description: unknown;
        actorId: number;
        actorName: string;
    }[]>;
    get(id: string): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    create(req: {
        user?: {
            userId?: number;
        };
    }, body: {
        companyId: number;
        projectId: number;
        title: string;
        description?: string;
        eventType?: PmSafetyEventType;
        siteId?: number;
        locationNote?: string;
        clientSyncId?: string;
        regionCode?: string;
    }): Promise<{
        dangerousOccurrence: import("../verisuite-sms/services/dangerous-occurrence.engine").DangerousOccurrenceAssessment;
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    update(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
        dangerousOccurrence: import("../verisuite-sms/services/dangerous-occurrence.engine").DangerousOccurrenceAssessment;
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    submit(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    review(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        action: 'approve' | 'reject' | 'request_changes';
        notes?: string;
    }): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    approve(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body?: {
        notes?: string;
    }): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    close(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        company: {
            id: number;
            name: string;
        };
        investigation: {
            id: string;
            eventId: string;
            status: import(".prisma/client").$Enums.PmInvestigationStatus;
            currentStep: number;
            narrative: string | null;
            immediateActions: string | null;
            guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
            causalTreeJson: import(".prisma/client").Prisma.JsonValue;
            sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
            hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
            energyWheelJson: import(".prisma/client").Prisma.JsonValue;
            executiveSummary: string | null;
            leadInvestigatorId: number | null;
            startedAt: Date | null;
            closedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            eventId: string;
            injuryId: string | null;
            equipmentLinkId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
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
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            eventId: string;
            equipmentId: number;
            conditionScore: number | null;
            failureNotes: string | null;
            lockoutApplied: boolean;
        })[];
        createdBy: {
            id: number;
            username: string;
        };
        injuries: {
            id: string;
            eventId: string;
            workerId: number | null;
            bodyPart: string | null;
            injuryType: string | null;
            treatment: string | null;
            firstAid: boolean;
            medicalAid: boolean;
            lostTime: boolean;
            modifiedWork: boolean;
            returnToWorkPlan: string | null;
            wcbClaimNumber: string | null;
            wcbStatus: string | null;
            notes: string | null;
            createdAt: Date;
        }[];
        people: {
            id: string;
            eventId: string;
            workerId: number | null;
            role: string;
            name: string | null;
            companyId: number | null;
            notes: string | null;
        }[];
        witnesses: ({
            statements: {
                id: string;
                eventId: string;
                witnessId: string | null;
                statementText: string;
                signatureData: string | null;
                signedAt: Date | null;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
        } & {
            id: string;
            eventId: string;
            name: string;
            contact: string | null;
            workerId: number | null;
            capturedByUserId: number | null;
            createdAt: Date;
        })[];
        statements: {
            id: string;
            eventId: string;
            witnessId: string | null;
            statementText: string;
            signatureData: string | null;
            signedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
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
    } & {
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
        sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
        sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
        sclPotentialSeverity: import(".prisma/client").$Enums.PmSafetyEventSeverity | null;
        energyProfileJson: import(".prisma/client").Prisma.JsonValue;
        mandatoryInvestigation: boolean;
        title: string;
        description: string | null;
        occurredAt: Date;
        locationNote: string | null;
        latitude: number | null;
        longitude: number | null;
        weatherJson: import(".prisma/client").Prisma.JsonValue;
        propertyDamageJson: import(".prisma/client").Prisma.JsonValue;
        environmentalImpactJson: import(".prisma/client").Prisma.JsonValue;
        dangerousOccurrenceJson: import(".prisma/client").Prisma.JsonValue;
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
    addTimeline(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        description: string;
        timestamp?: string;
    }): Promise<{
        timestamp: Date;
        description: string;
        actorId?: number;
        eventId: string;
    }>;
    suggestRca(id: string): Promise<any[]>;
    addRca(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
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
    }>;
    addInjury(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        eventId: string;
        workerId: number | null;
        bodyPart: string | null;
        injuryType: string | null;
        treatment: string | null;
        firstAid: boolean;
        medicalAid: boolean;
        lostTime: boolean;
        modifiedWork: boolean;
        returnToWorkPlan: string | null;
        wcbClaimNumber: string | null;
        wcbStatus: string | null;
        notes: string | null;
        createdAt: Date;
    }>;
    addPerson(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        eventId: string;
        workerId: number | null;
        role: string;
        name: string | null;
        companyId: number | null;
        notes: string | null;
    }>;
    linkEquipment(id: string, body: {
        equipmentId: number;
        failureNotes?: string;
        conditionScore?: number;
    }): Promise<{
        id: string;
        eventId: string;
        equipmentId: number;
        conditionScore: number | null;
        failureNotes: string | null;
        lockoutApplied: boolean;
    }>;
    addWitness(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        name: string;
        contact?: string;
        workerId?: number;
    }): Promise<{
        id: string;
        eventId: string;
        name: string;
        contact: string | null;
        workerId: number | null;
        capturedByUserId: number | null;
        createdAt: Date;
    }>;
    addStatement(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        eventId: string;
        witnessId: string | null;
        statementText: string;
        signatureData: string | null;
        signedAt: Date | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    addAttachment(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        eventId: string;
        injuryId: string | null;
        equipmentLinkId: string | null;
        correctiveId: string | null;
        storageKey: string | null;
        fileName: string | null;
        mimeType: string | null;
        dataUrl: string | null;
        coreFileId: number | null;
        annotationJson: import(".prisma/client").Prisma.JsonValue | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    addFactor(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        eventId: string;
        libraryCode: string | null;
        label: string;
        category: string | null;
        notes: string | null;
    }>;
    openInvestigation(id: string, req: {
        user?: {
            userId?: number;
        };
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
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInvestigation(id: string): Promise<{
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
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateInvestigation(id: string, body: Record<string, unknown>): Promise<{
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
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    guidedQuestions(id: string): Promise<{
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
    saveGuidedAnswers(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        answers: Record<string, string>;
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
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    causalTree(id: string): Promise<import(".prisma/client").Prisma.JsonValue>;
    regenerateCausalTree(id: string): Promise<{
        id: string;
        eventId: string;
        status: import(".prisma/client").$Enums.PmInvestigationStatus;
        currentStep: number;
        narrative: string | null;
        immediateActions: string | null;
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suggestInvestigation(id: string): Promise<{
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
    investigationReport(id: string): Promise<{
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
    investigationReportHtml(id: string): Promise<string>;
}
