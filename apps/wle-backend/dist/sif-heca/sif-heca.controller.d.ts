import { SifHecaEventStatus, SifHecaSourceType } from '@prisma/client';
import { SifHecaService } from './sif-heca.service';
import { SifHecaIngestionService } from './sif-heca-ingestion.service';
import { SifHecaOrchestratorService } from './sif-heca-orchestrator.service';
export declare class SifHecaController {
    private readonly sifHeca;
    private readonly ingestion;
    private readonly orchestrator;
    constructor(sifHeca: SifHecaService, ingestion: SifHecaIngestionService, orchestrator: SifHecaOrchestratorService);
    listEvents(projectId?: string, companyId?: string, status?: SifHecaEventStatus, workerId?: string): Promise<({
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredCorrective: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
            computedAt: Date;
        };
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
        rawPayload: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getEvent(id: string): Promise<{
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredCorrective: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
        rawPayload: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    orchestratorAnalysis(id: string): Promise<import("./sif-heca-orchestrator.service").VeraOrchestratorSection & {
        moduleType: string;
        recordId: string;
    }>;
    evaluate(body: {
        companyId: number;
        projectId: number;
        title: string;
        description?: string;
        hazardSeverity: number;
        hazardLikelihood: number;
        energyTypes: string[];
        controls?: Array<{
            controlType: string;
            adequate?: boolean;
            effectivenessScore?: number;
            verified?: boolean;
            ppeRequired?: boolean;
        }>;
    }): Promise<{
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
        csra: import("./csra-heca.engine").CsraAssessmentOutput;
    }>;
    analyzeScope(body: {
        companyId: number;
        projectId: number;
        title: string;
        jobDescription?: string;
        workScope?: string;
        locationNote?: string;
        environmentNote?: string;
        equipmentNote?: string;
    }): Promise<{
        analysis: import("./sif-heca-scope-analysis.service").SifHecaScopeAnalysisResult;
        evaluation: {
            csra: import("./csra-heca.engine").CsraAssessmentOutput;
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
        };
        csra: import("./csra-heca.engine").CsraAssessmentOutput;
    }>;
    csraAssess(body: {
        companyId: number;
        projectId: number;
        title: string;
        description?: string;
        workScope?: string;
        locationNote?: string;
        environmentNote?: string;
        equipmentNote?: string;
        energyTypes?: string[];
        exposureLevel?: 1 | 2 | 3 | 4 | 5;
        proximity?: 'contact' | 'near' | 'zone' | 'remote';
        controls?: Array<{
            description?: string;
            controlType: string;
            adequate?: boolean | null;
            effectivenessScore?: number | null;
            verified?: boolean;
            energyTypes?: string[];
        }>;
    }): Promise<import("./csra-heca.engine").CsraAssessmentOutput>;
    energyWheel(): {
        segments: readonly [{
            readonly type: "gravity";
            readonly label: "Gravity / falling";
            readonly highEnergy: true;
        }, {
            readonly type: "mechanical";
            readonly label: "Mechanical / moving parts";
            readonly highEnergy: true;
        }, {
            readonly type: "electrical";
            readonly label: "Electrical";
            readonly highEnergy: true;
        }, {
            readonly type: "pressure";
            readonly label: "Pressure / pneumatic";
            readonly highEnergy: true;
        }, {
            readonly type: "thermal";
            readonly label: "Thermal";
            readonly highEnergy: false;
        }, {
            readonly type: "chemical";
            readonly label: "Chemical";
            readonly highEnergy: false;
        }, {
            readonly type: "radiation";
            readonly label: "Radiation";
            readonly highEnergy: false;
        }, {
            readonly type: "biological";
            readonly label: "Biological";
            readonly highEnergy: false;
        }, {
            readonly type: "motion";
            readonly label: "Motion / ergonomics";
            readonly highEnergy: false;
        }];
    };
    score(req: {
        user?: {
            userId?: number;
        };
    }, body: {
        companyId: number;
        projectId: number;
        siteId?: number;
        workerId?: number;
        sourceType: SifHecaSourceType;
        sourceId: string;
        sourceItemId?: string;
        title: string;
        description?: string;
        hazardSeverity: number;
        hazardLikelihood: number;
        energyTypes: string[];
        controls?: Array<{
            controlType: string;
            adequate?: boolean;
            effectivenessScore?: number;
            verified?: boolean;
            ppeRequired?: boolean;
        }>;
    }): Promise<{
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredCorrective: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
        rawPayload: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredCorrective: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
        rawPayload: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ingestJha(jhaFlhaId: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<any[]>;
    ingestForm(formId: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredCorrective: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
        rawPayload: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    analytics(projectId: string): Promise<{
        projectId: number;
        totalEvents: number;
        events90d: number;
        sifHighCount: number;
        highEnergyCount: number;
        averageSifScore: number;
        hecaDistribution: Record<string, number>;
        sourceDistribution: Record<string, number>;
        projectSifScore: number;
        leadingIndicators: {
            sifRatePct: number;
            highEnergyRatePct: number;
            events90d: number;
        };
        laggingIndicators: {
            reviewRequired: number;
            openCorrective: number;
        };
    }>;
    accessCheck(workerId: string, projectId: string): Promise<{
        allowed: boolean;
        openCriticalEvents: number;
        openCorrectiveActions: number;
    }>;
    sync(req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
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
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredCorrective: import(".prisma/client").Prisma.JsonValue;
            explainability: import(".prisma/client").Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
        rawPayload: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    indicators(companyId: string, projectId?: string): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        code: string;
        label: string;
        description: string | null;
        weight: number;
        triggerRule: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
    }[]>;
    hecaCategories(companyId: string, projectId?: string): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        code: string;
        label: string;
        description: string | null;
        keywordPatterns: import(".prisma/client").Prisma.JsonValue;
        energyTypes: import(".prisma/client").Prisma.JsonValue;
        severityDefault: number;
        active: boolean;
        createdAt: Date;
    }[]>;
}
