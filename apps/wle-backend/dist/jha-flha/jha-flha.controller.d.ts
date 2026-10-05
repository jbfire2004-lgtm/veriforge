import { JhaFlhaKind, JhaFlhaSignatureRole, JhaFlhaStatus } from '@prisma/client';
import { JhaFlhaService } from './jha-flha.service';
import { JhaLibraryService } from './jha-library.service';
import { JhaFlhaOrchestratorService } from './jha-flha-orchestrator.service';
import { JhaFlhaEngineService } from './jha-flha-engine.service';
import type { JhaFlhaEngineInput } from './jha-flha-engine.types';
export declare class JhaFlhaController {
    private readonly jha;
    private readonly library;
    private readonly orchestrator;
    private readonly engine;
    constructor(jha: JhaFlhaService, library: JhaLibraryService, orchestrator: JhaFlhaOrchestratorService, engine: JhaFlhaEngineService);
    generateJhaFlha(body: JhaFlhaEngineInput): import("./jha-flha-engine.types").JhaFlhaEngineOutput;
    list(projectId?: string, companyId?: string, status?: JhaFlhaStatus, kind?: JhaFlhaKind): Promise<({
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    create(req: {
        user?: {
            userId?: number;
        };
    }, body: {
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    energyWheel(): {
        type: import(".prisma/client").JhaEnergyType;
        label: string;
        requiredControlTypes: string[];
        highExposureThreshold: number;
    }[];
    hazards(companyId: string, projectId?: string, taskCode?: string): Promise<{
        id: string;
        category: string;
        subcategory: string;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
        defaultEnergyTypes: string[];
        keywords: string[];
    }[]>;
    controls(companyId: string, projectId?: string, category?: string): Promise<{
        id: string;
        controlType: string;
        description: string;
        hazardCategories: string[];
        energyTypes: string[];
        ppeRequired: boolean;
        controlClass: "direct" | "alternative";
    }[]>;
    tasks(companyId: string, projectId?: string): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        taskCode: string;
        title: string;
        description: string | null;
        defaultHazardIds: import(".prisma/client").Prisma.JsonValue;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
    }[]>;
    libraryPacks(companyId: string): Promise<{
        packIds: import("./jha-industry-packs").JhaIndustryPackId[];
        labels: string[];
    }>;
    projectLearnings(projectId: string): Promise<import("./jha-library-learning.service").ProjectLearnings>;
    suggestLibrary(companyId: string, projectId?: string, taskDescription?: string, locationNote?: string, weather?: string, hazardCategories?: string, energyTypes?: string, existingHazards?: string, existingControls?: string, focusedHazardCategory?: string, focusedHazardEnergyTypes?: string, focusedHazardDescription?: string): Promise<import("./jha-suggestion.engine").JhaSuggestionResult>;
    createLibraryHazard(body: {
        companyId: number;
        projectId?: number;
        category: string;
        description: string;
        subcategory?: string;
        defaultEnergyTypes?: string[];
    }): Promise<{
        id: string;
        seedKey: string | null;
        companyId: number | null;
        projectId: number | null;
        category: string;
        subcategory: string | null;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
        defaultEnergyTypes: import(".prisma/client").Prisma.JsonValue;
        defaultControlKeys: import(".prisma/client").Prisma.JsonValue;
        taskTypes: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
    }>;
    createLibraryControl(body: {
        companyId: number;
        projectId?: number;
        controlType: string;
        description: string;
        hazardCategories?: string[];
        ppeRequired?: boolean;
    }): Promise<{
        id: string;
        seedKey: string | null;
        companyId: number | null;
        projectId: number | null;
        controlType: string;
        description: string;
        hazardCategories: import(".prisma/client").Prisma.JsonValue;
        energyTypes: import(".prisma/client").Prisma.JsonValue;
        ppeRequired: boolean;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
    }>;
    analytics(projectId: string): Promise<{
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
    workerCompliance(workerId: string, projectId: string): Promise<{
        compliant: boolean;
        jhaFlhaId: string;
        approvedAt: string;
    }>;
    sync(req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    get(id: string): Promise<{
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    updateDraft(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    addHazard(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: Parameters<JhaFlhaService['addHazard']>[1]): Promise<{
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
        energyTypes: import(".prisma/client").Prisma.JsonValue;
        sifIndicator: boolean;
        createdAt: Date;
    }>;
    addControl(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: Parameters<JhaFlhaService['addControl']>[1]): Promise<{
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
    setEnergy(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        sources: Parameters<JhaFlhaService['setEnergySources']>[1];
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    setCrew(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        workers: Array<{
            workerId: number;
            role?: string;
        }>;
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    setEquipment(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        items: Array<{
            equipmentId: number;
            authorized?: boolean;
        }>;
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    score(id: string): Promise<{
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
    orchestratorAnalysis(id: string): Promise<import("./jha-flha-orchestrator.service").VeraOrchestratorSection & {
        moduleType: string;
        recordId: string;
    }>;
    submit(id: string, req: {
        user?: {
            userId?: number;
        };
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    review(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        action: 'approve' | 'reject' | 'request_changes';
        reviewNotes?: string;
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    lock(id: string, req: {
        user?: {
            userId?: number;
        };
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    sign(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        role: JhaFlhaSignatureRole;
        signatureData: string;
        signerName?: string;
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
            annotation: import(".prisma/client").Prisma.JsonValue | null;
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
            energyTypes: import(".prisma/client").Prisma.JsonValue;
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
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
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
    addAttachment(id: string, body: {
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
        annotation: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    }>;
    suggestions(id: string): Promise<{
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
            defaultEnergyTypes: import(".prisma/client").Prisma.JsonValue;
            defaultControlKeys: import(".prisma/client").Prisma.JsonValue;
            taskTypes: import(".prisma/client").Prisma.JsonValue;
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
            hazardCategories: import(".prisma/client").Prisma.JsonValue;
            energyTypes: import(".prisma/client").Prisma.JsonValue;
            ppeRequired: boolean;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
        }[];
        energyWheel: {
            type: import(".prisma/client").JhaEnergyType;
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
}
