import { PmWorkerAuthorizationType, PmWorkerMedicalRestrictionType, PmWorkerSafetyOverrideType } from '@prisma/client';
import { PmWorkerSafetyProfileService } from './pm-worker-safety-profile.service';
import { PmWorkerSafetyCailIntelligenceService } from './pm-worker-safety-cail-intelligence.service';
export declare class PmWorkerSafetyController {
    private readonly workers;
    private readonly cail;
    constructor(workers: PmWorkerSafetyProfileService, cail: PmWorkerSafetyCailIntelligenceService);
    profile(body: {
        workerId: number;
        rebuild?: boolean;
        projectId?: number;
        roleType?: string;
        tradeCode?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        profile: {
            id: string;
            workerId: number;
            companyId: number | null;
            version: number;
            status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
            roleType: string | null;
            tradeCode: string | null;
            safetyScore: number;
            riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
            scoreFactorsJson: import(".prisma/client").Prisma.JsonValue;
            requiredActionsJson: import(".prisma/client").Prisma.JsonValue;
            requiresSupervisorReview: boolean;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    training(body: {
        workerId: number;
        trainingCode: string;
        courseName: string;
        completedAt?: string;
        expiryDate?: string;
        expiresAt?: string;
        competencyLevel?: number;
        certificatePath?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        workerId: number;
        profileId: string | null;
        trainingCode: string;
        courseName: string;
        providerName: string | null;
        competencyLevel: number;
        completedAt: Date | null;
        expiresAt: Date | null;
        required: boolean;
        sourceType: string | null;
        legacyRecordId: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    authorization(body: {
        workerId: number;
        equipmentType?: string;
        authType?: PmWorkerAuthorizationType;
        authorizationType?: PmWorkerAuthorizationType;
        equipmentId?: number;
        issueDate?: string;
        issuedAt?: string;
        expiryDate?: string;
        expiresAt?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        workerId: number;
        profileId: string | null;
        companyId: number | null;
        authType: import(".prisma/client").$Enums.PmWorkerAuthorizationType;
        equipmentId: number | null;
        issuedByUserId: number | null;
        issuedAt: Date;
        expiresAt: Date | null;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        requiredCerts: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        legacyAuthId: string | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    restriction(body: {
        workerId: number;
        restrictionType: PmWorkerMedicalRestrictionType;
        description: string;
        expiry?: string;
        expiresAt?: string;
        blocksHighRisk?: boolean;
        blocksConfinedSpace?: boolean;
        blocksHotWork?: boolean;
        blocksEquipment?: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        workerId: number;
        profileId: string | null;
        restrictionType: import(".prisma/client").$Enums.PmWorkerMedicalRestrictionType;
        description: string;
        blocksHighRisk: boolean;
        blocksConfinedSpace: boolean;
        blocksHotWork: boolean;
        blocksEquipment: boolean;
        startsAt: Date;
        expiresAt: Date | null;
        active: boolean;
        createdAt: Date;
    }>;
    exposure(body: {
        workerId: number;
        hazardId?: string;
        hazardType?: string;
        severity?: number;
        likelihood?: number;
        exposureDate?: string;
        projectId?: number;
        sifPotential?: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        workerId: number;
        profileId: string | null;
        projectId: number | null;
        sourceType: import(".prisma/client").$Enums.PmWorkerHazardExposureSource;
        sourceId: string | null;
        hazardType: string;
        severity: number;
        likelihood: number;
        sifPotential: boolean;
        hecaCategoryKey: string | null;
        exposedAt: Date;
    }>;
    corrective(body: {
        workerId: number;
        correctiveActionId?: string;
        corrective_action_id?: string;
        status?: string;
        dueDate?: string;
        due_date?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        workerId: number;
        profileId: string | null;
        capaId: string;
        status: string;
        dueAt: Date | null;
        sifLinked: boolean;
        createdAt: Date;
    }>;
    override(body: {
        workerId: number;
        overrideType: PmWorkerSafetyOverrideType;
        ruleKey: string;
        reason: string;
        expiry?: string;
        expiresAt?: string;
        projectId?: number;
        supervisorSig?: string;
        safetySig?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        workerId: number;
        profileId: string | null;
        companyId: number | null;
        projectId: number | null;
        overrideType: import(".prisma/client").$Enums.PmWorkerSafetyOverrideType;
        ruleKey: string;
        reason: string;
        expiresAt: Date;
        supervisorSig: string | null;
        safetySig: string | null;
        approvedById: number | null;
        active: boolean;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    offlineSync(body: {
        workerId: number;
    } & Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        ok: boolean;
        applied: number;
        serverState: {
            syncedAt: string;
            identity: {
                workerId: number;
                name: string;
                companyId: number;
                email: string;
                qrToken: string;
                projects: {
                    id: number;
                    name: string;
                }[];
            };
            profile: {
                competencies: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    competencyKey: string;
                    level: number;
                    evaluatedAt: Date;
                    expiresAt: Date | null;
                    evaluatorId: number | null;
                    legacyEvalId: number | null;
                    createdAt: Date;
                }[];
                overrides: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    companyId: number | null;
                    projectId: number | null;
                    overrideType: import(".prisma/client").$Enums.PmWorkerSafetyOverrideType;
                    ruleKey: string;
                    reason: string;
                    expiresAt: Date;
                    supervisorSig: string | null;
                    safetySig: string | null;
                    approvedById: number | null;
                    active: boolean;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
                trainingSnapshots: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    trainingCode: string;
                    courseName: string;
                    providerName: string | null;
                    competencyLevel: number;
                    completedAt: Date | null;
                    expiresAt: Date | null;
                    required: boolean;
                    sourceType: string | null;
                    legacyRecordId: number | null;
                    status: string;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                authorizations: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    companyId: number | null;
                    authType: import(".prisma/client").$Enums.PmWorkerAuthorizationType;
                    equipmentId: number | null;
                    issuedByUserId: number | null;
                    issuedAt: Date;
                    expiresAt: Date | null;
                    requiredTraining: import(".prisma/client").Prisma.JsonValue;
                    requiredCerts: import(".prisma/client").Prisma.JsonValue;
                    active: boolean;
                    legacyAuthId: string | null;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
                medicalRestrictions: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    restrictionType: import(".prisma/client").$Enums.PmWorkerMedicalRestrictionType;
                    description: string;
                    blocksHighRisk: boolean;
                    blocksConfinedSpace: boolean;
                    blocksHotWork: boolean;
                    blocksEquipment: boolean;
                    startsAt: Date;
                    expiresAt: Date | null;
                    active: boolean;
                    createdAt: Date;
                }[];
                hazardExposures: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    projectId: number | null;
                    sourceType: import(".prisma/client").$Enums.PmWorkerHazardExposureSource;
                    sourceId: string | null;
                    hazardType: string;
                    severity: number;
                    likelihood: number;
                    sifPotential: boolean;
                    hecaCategoryKey: string | null;
                    exposedAt: Date;
                }[];
                incidentHistory: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    projectId: number | null;
                    eventType: string;
                    sourceId: string | null;
                    title: string;
                    severity: string | null;
                    occurredAt: Date;
                }[];
                correctiveActionLinks: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    capaId: string;
                    status: string;
                    dueAt: Date | null;
                    sifLinked: boolean;
                    createdAt: Date;
                }[];
                accessLogs: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    projectId: number | null;
                    zoneCode: string | null;
                    equipmentId: number | null;
                    granted: boolean;
                    decision: string | null;
                    denialReasons: import(".prisma/client").Prisma.JsonValue;
                    sourceAttemptId: string | null;
                    createdAt: Date;
                }[];
                scoreHistory: {
                    id: string;
                    workerId: number;
                    profileId: string | null;
                    score: number;
                    riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
                    factorsJson: import(".prisma/client").Prisma.JsonValue;
                    computedAt: Date;
                }[];
            } & {
                id: string;
                workerId: number;
                companyId: number | null;
                version: number;
                status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                roleType: string | null;
                tradeCode: string | null;
                safetyScore: number;
                riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
                scoreFactorsJson: import(".prisma/client").Prisma.JsonValue;
                requiredActionsJson: import(".prisma/client").Prisma.JsonValue;
                requiresSupervisorReview: boolean;
                metadataJson: import(".prisma/client").Prisma.JsonValue;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            accessEvaluation: Record<string, unknown>;
            cailInsights: import("./pm-worker-safety-cail-intelligence.service").WorkerCailInsight[];
            integrations: {
                companyContext: boolean;
                projectContext: boolean;
                siteAccess: boolean;
            };
        };
    }>;
    score(workerId: number, projectId?: string): Promise<{
        workerId: number;
        workerName: string;
        score: number;
        maxScore: number;
        riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
        complianceState: "compliant" | "restricted" | "non_compliant" | "override_required" | "override_approved";
        factors: Record<string, number>;
        requiredActions: string[];
        chronicHazardExposure: {
            chronic: boolean;
            count: number;
            highSeverityCount: number;
        };
        trainingNeeds: {
            trainingCode: string;
            reason: string;
            priority: string;
        }[];
        authorizationNeeds: {
            authType: string;
            reason: string;
        }[];
        weakControlSignals: string[];
        incidentForecast: {
            probability: number;
            level: string;
            factors: string[];
        };
        profile: {
            id: string;
            workerId: number;
            companyId: number | null;
            version: number;
            status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
            roleType: string | null;
            tradeCode: string | null;
            safetyScore: number;
            riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
            scoreFactorsJson: import(".prisma/client").Prisma.JsonValue;
            requiredActionsJson: import(".prisma/client").Prisma.JsonValue;
            requiresSupervisorReview: boolean;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        computedAt: string;
    }>;
    analytics(workerId: number): Promise<{
        currentScore: number;
        riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
        scoreTrend: {
            score: number;
            at: string;
        }[];
        trainingCompliancePct: number;
        accessDenialRate30d: number;
        hazardExposures30d: number;
        openCapa: number;
        incidentForecast: {
            probability: number;
            level: string;
            factors: string[];
        };
        cailInsights: import("./pm-worker-safety-cail-intelligence.service").WorkerCailInsight[];
    }>;
    cailBundle(workerId: number, projectId?: string): Promise<{
        insights: import("./pm-worker-safety-cail-intelligence.service").WorkerCailInsight[];
        trainingNeeds: {
            trainingCode: string;
            reason: string;
            priority: string;
        }[];
        authorizationNeeds: {
            authType: string;
            reason: string;
        }[];
        score: number;
        complianceState: "compliant" | "restricted" | "non_compliant" | "override_required" | "override_approved";
        incidentForecast: {
            probability: number;
            level: string;
            factors: string[];
        };
    }>;
}
