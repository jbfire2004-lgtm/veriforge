import { Prisma, SifHecaEventStatus, SifHecaSourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifScoringEngine } from './sif-scoring.engine';
import { HecaClassificationEngine } from './heca-classification.engine';
import { ControlEffectivenessEngine } from './control-effectiveness.engine';
import { CsraHecaEngine } from './csra-heca.engine';
import { SifHecaCailService } from './sif-heca-cail.service';
import { SifHecaScopeAnalysisService, type SifHecaScopeInput } from './sif-heca-scope-analysis.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
export declare class SifHecaService {
    private readonly prisma;
    private readonly sifEngine;
    private readonly hecaEngine;
    private readonly controlEngine;
    private readonly csraEngine;
    private readonly cail;
    private readonly scopeAnalysis;
    private readonly capaAuto?;
    constructor(prisma: PrismaService, sifEngine: SifScoringEngine, hecaEngine: HecaClassificationEngine, controlEngine: ControlEffectivenessEngine, csraEngine: CsraHecaEngine, cail: SifHecaCailService, scopeAnalysis: SifHecaScopeAnalysisService, capaAuto?: PmCapaAutoGenerateService);
    private audit;
    ensureLibraries(companyId: number, projectId?: number): Promise<void>;
    evaluateDryRun(input: {
        title: string;
        description?: string;
        companyId: number;
        projectId: number;
        scoringInput: {
            hazardSeverity: number;
            hazardLikelihood: number;
            energyTypes: string[];
            controls?: Array<{
                controlType: string;
                adequate: boolean | null;
                effectivenessScore: number | null;
                verified: boolean;
                ppeRequired: boolean;
            }>;
        };
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
    assessCsra(input: {
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
    analyzeScope(input: SifHecaScopeInput): Promise<{
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
    ingest(input: {
        companyId: number;
        projectId: number;
        siteId?: number;
        workerId?: number;
        equipmentId?: number;
        sourceType: SifHecaSourceType;
        sourceId: string;
        sourceItemId?: string;
        title: string;
        description?: string;
        rawPayload?: Record<string, unknown>;
        scoringInput: {
            hazardSeverity: number;
            hazardLikelihood: number;
            energyTypes: string[];
            controls?: Array<{
                controlType: string;
                adequate: boolean | null;
                effectivenessScore: number | null;
                verified: boolean;
                ppeRequired: boolean;
            }>;
        };
        actorId?: number;
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
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
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
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    scoreEvent(eventId: string, scoringInput: {
        hazardSeverity: number;
        hazardLikelihood: number;
        energyTypes: string[];
        controls?: Array<{
            controlType: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            ppeRequired: boolean;
        }>;
    }, actorId?: number): Promise<{
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
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
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
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
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
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(filters: {
        projectId?: number;
        companyId?: number;
        status?: SifHecaEventStatus;
        workerId?: number;
    }): Promise<({
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
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    supervisorReview(eventId: string, action: 'approve' | 'reject' | 'request_changes', actorId?: number, notes?: string): Promise<{
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
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
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
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    workerAccessCheck(workerId: number, projectId: number): Promise<{
        allowed: boolean;
        openCriticalEvents: number;
        openCorrectiveActions: number;
    }>;
    listIndicators(companyId: number, projectId?: number): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        code: string;
        label: string;
        description: string | null;
        weight: number;
        triggerRule: Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
    }[]>;
    getEnergyWheel(): {
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
    listHecaCategories(companyId: number, projectId?: number): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        code: string;
        label: string;
        description: string | null;
        keywordPatterns: Prisma.JsonValue;
        energyTypes: Prisma.JsonValue;
        severityDefault: number;
        active: boolean;
        createdAt: Date;
    }[]>;
    projectAnalytics(projectId: number): Promise<{
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
    syncOffline(payload: {
        clientSyncId: string;
        companyId: number;
        projectId: number;
        siteId?: number;
        workerId?: number;
        assessmentKind?: 'SIF' | 'HECA';
        sourceType?: SifHecaSourceType;
        sourceId?: string;
        sourceItemId?: string;
        title: string;
        description?: string;
        jobDescription?: string;
        workScope?: string;
        locationNote?: string;
        environmentNote?: string;
        equipmentNote?: string;
        hazards?: Array<{
            description: string;
            severity?: number;
            likelihood?: number;
            energyTypes?: string[];
        }>;
        controls?: Array<{
            description?: string;
            controlType?: string;
            adequate?: boolean;
            effectivenessScore?: number;
        }>;
        energyTypes?: string[];
        scoringInput?: {
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
        };
        submit?: boolean;
        actorId?: number;
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
            requiredControls: Prisma.JsonValue;
            requiredActions: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
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
            requiredControls: Prisma.JsonValue;
            requiredCorrective: Prisma.JsonValue;
            explainability: Prisma.JsonValue;
            computedAt: Date;
        };
        auditLogs: {
            id: string;
            eventId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
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
        rawPayload: Prisma.JsonValue;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private generateCorrectiveActions;
}
