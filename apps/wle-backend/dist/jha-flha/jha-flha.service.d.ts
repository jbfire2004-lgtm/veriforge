import { JhaEnergyType, JhaFlhaKind, JhaFlhaSignatureRole, JhaFlhaStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JhaScoringService } from './jha-scoring.service';
import { JhaCailBridgeService } from './jha-cail-bridge.service';
import { JhaLibraryService } from './jha-library.service';
import { SifHecaIngestionService } from '../sif-heca/sif-heca-ingestion.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmUnifiedCorrectiveActionService } from '../pm-unified-corrective-action/pm-unified-corrective-action.service';
import { AdoptionEventService } from '../modules/adoption-analytics/adoption-event.service';
export declare class JhaFlhaService {
    private readonly prisma;
    private readonly scoring;
    private readonly cail;
    private readonly library;
    private readonly sifIngestion?;
    private readonly capaAuto?;
    private readonly unifiedCapa?;
    private readonly adoption?;
    constructor(prisma: PrismaService, scoring: JhaScoringService, cail: JhaCailBridgeService, library: JhaLibraryService, sifIngestion?: SifHecaIngestionService, capaAuto?: PmCapaAutoGenerateService, unifiedCapa?: PmUnifiedCorrectiveActionService, adoption?: AdoptionEventService);
    private audit;
    private fullInclude;
    list(filters: {
        projectId?: number;
        companyId?: number;
        status?: JhaFlhaStatus;
        kind?: JhaFlhaKind;
    }): Promise<({
        project: {
            id: number;
            name: string;
        };
        _count: {
            workers: number;
            hazards: number;
        };
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getById(id: string): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getScore(id: string): Promise<{
        jhaFlhaId: string;
        riskScore: number;
        taskRiskScore: number;
        sifScore: number;
        sifPotential: boolean;
        highEnergyFlag: boolean;
        qualityScore: number;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean;
        missingControls: string[];
        weakControls: string[];
        blockSubmission: boolean;
        blockReasons: string[];
        supervisorReviewFlags: import("./jha-scoring.service").SupervisorReviewFlag[];
        ppeOnlyHighEnergyHazards: string[];
    }>;
    getProjectAnalytics(projectId: number): Promise<{
        projectId: number;
        windowDays: number;
        totals: {
            jhas: number;
            approved: number;
            sifFlagged: number;
        };
        scores: {
            jhaQualityScore: number;
            hazardCoverageScore: number;
            controlEffectivenessScore: number;
            workerParticipationScore: number;
            projectRiskContribution: number;
        };
        trends: {
            sifRatePct: number;
            approvalRatePct: number;
        };
        leadingIndicators: {
            avgHazardsPerJha: number;
            avgControlsPerJha: number;
            underReview: number;
        };
        laggingIndicators: {
            rejected: number;
            draftOpen: number;
        };
    }>;
    create(input: {
        kind?: JhaFlhaKind;
        companyId: number;
        projectId: number;
        siteId?: number;
        workPackageId?: string;
        taskId?: string;
        taskLibraryId?: string;
        taskDescription: string;
        workScope?: string;
        locationNote?: string;
        environmentalJson?: Record<string, unknown>;
        createdByUserId?: number;
        clientSyncId?: string;
    }): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateDraft(id: string, data: Partial<{
        taskDescription: string;
        workScope: string;
        locationNote: string;
        environmentalJson: Record<string, unknown>;
    }>, actorId?: number): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addHazard(jhaFlhaId: string, data: {
        libraryEntryId?: string;
        category?: string;
        subcategory?: string;
        description: string;
        severity?: number;
        likelihood?: number;
        energyTypes?: string[];
        sifIndicator?: boolean;
    }, actorId?: number): Promise<{
        id: string;
        jhaFlhaId: string;
        sortOrder: number;
        libraryEntryId: string | null;
        category: string | null;
        subcategory: string | null;
        description: string;
        severity: number;
        likelihood: number;
        riskScore: number;
        energyTypes: Prisma.JsonValue;
        sifIndicator: boolean;
        createdAt: Date;
    }>;
    private syncEnergyFromHazards;
    addControl(jhaFlhaId: string, data: {
        hazardId?: string;
        libraryEntryId?: string;
        controlType: string;
        description: string;
        adequate?: boolean;
        ppeRequired?: boolean;
    }, actorId?: number): Promise<{
        id: string;
        jhaFlhaId: string;
        hazardId: string | null;
        libraryEntryId: string | null;
        controlType: string;
        description: string;
        adequate: boolean | null;
        effectivenessScore: number | null;
        verified: boolean;
        verifiedAt: Date | null;
        ppeRequired: boolean;
        createdAt: Date;
    }>;
    setEnergySources(jhaFlhaId: string, sources: Array<{
        energyType: JhaEnergyType;
        exposureLevel: number;
        controlsSummary?: string;
    }>, actorId?: number): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setCrew(jhaFlhaId: string, workers: Array<{
        workerId: number;
        role?: string;
    }>, actorId?: number): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setEquipment(jhaFlhaId: string, items: Array<{
        equipmentId: number;
        authorized?: boolean;
    }>, actorId?: number): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    evaluate(id: string): Promise<{
        jhaFlhaId: string;
        riskScore: number;
        taskRiskScore: number;
        sifScore: number;
        sifPotential: boolean;
        highEnergyFlag: boolean;
        qualityScore: number;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean;
        missingControls: string[];
        weakControls: string[];
        blockSubmission: boolean;
        blockReasons: string[];
        supervisorReviewFlags: import("./jha-scoring.service").SupervisorReviewFlag[];
        ppeOnlyHighEnergyHazards: string[];
    }>;
    submit(id: string, actorId?: number): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    supervisorReview(id: string, action: 'approve' | 'reject' | 'request_changes', actorId?: number, reviewNotes?: string): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    lock(id: string, actorId?: number): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sign(id: string, data: {
        role: JhaFlhaSignatureRole;
        signatureData: string;
        signerName?: string;
        signerUserId?: number;
        workerId?: number;
    }): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addAttachment(id: string, data: {
        fileName: string;
        mimeType?: string;
        storageKey?: string;
        dataUrl?: string;
    }): Promise<{
        id: string;
        jhaFlhaId: string;
        fileName: string;
        mimeType: string | null;
        storageKey: string | null;
        dataUrl: string | null;
        annotation: Prisma.JsonValue | null;
        createdAt: Date;
    }>;
    getSuggestions(id: string): Promise<{
        hazards: {
            id: string;
            seedKey: string | null;
            companyId: number | null;
            projectId: number | null;
            category: string;
            subcategory: string | null;
            description: string;
            defaultSeverity: number;
            defaultLikelihood: number;
            defaultEnergyTypes: Prisma.JsonValue;
            defaultControlKeys: Prisma.JsonValue;
            taskTypes: Prisma.JsonValue;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            seedKey: string | null;
            companyId: number | null;
            projectId: number | null;
            controlType: string;
            description: string;
            hazardCategories: Prisma.JsonValue;
            energyTypes: Prisma.JsonValue;
            ppeRequired: boolean;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
        }[];
        energyWheel: {
            type: JhaEnergyType;
            label: string;
            requiredControlTypes: string[];
            highExposureThreshold: number;
        }[];
        suggestedHazards: (import("./jha-library-seed").HazardSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
        })[];
        suggestedControls: (import("./jha-library-seed").ControlSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
        })[];
        warnings: string[];
        crewOftenAdds: {
            hazards: Array<{
                description: string;
                category?: string;
                count: number;
                reason: string;
            }>;
            controls: Array<{
                description: string;
                controlType?: string;
                count: number;
                reason: string;
            }>;
        };
        missedHazards: (import("./jha-library-seed").HazardSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
            profileId?: string;
        })[];
        missedControls: (import("./jha-library-seed").ControlSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
            profileId?: string;
        })[];
        requiredEnergyTypes: string[];
        matchedTaskProfiles: string[];
        gapWarnings: string[];
        hecaNotes: string[];
    }>;
    workerCompliance(workerId: number, projectId: number): Promise<{
        compliant: boolean;
        jhaFlhaId: string;
        approvedAt: string;
    }>;
    syncOffline(payload: {
        clientSyncId: string;
        kind: JhaFlhaKind;
        companyId: number;
        projectId: number;
        siteId?: number;
        taskDescription: string;
        workScope?: string;
        locationNote?: string;
        environmentalJson?: Record<string, unknown>;
        hazards?: Array<{
            description: string;
            category?: string;
            severity?: number;
            likelihood?: number;
            energyTypes?: string[];
        }>;
        controls?: Array<{
            description: string;
            controlType?: string;
            hazardIndex?: number;
        }>;
        energySources?: Array<{
            energyType: string;
            exposureLevel?: number;
        }>;
        equipment?: Array<{
            equipmentId: number;
            authorized?: boolean;
        }>;
        workers?: Array<{
            workerId: number;
            role?: string;
        }>;
        signatures?: Array<{
            role: JhaFlhaSignatureRole;
            signatureData: string;
            signerName?: string;
            workerId?: number;
        }>;
        submit?: boolean;
        actorId?: number;
    }): Promise<{
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private assertEditable;
    private buildEvaluation;
    private recomputeScores;
    private snapshotVersion;
}
