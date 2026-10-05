import { PmWorkerMedicalRestrictionType, PmWorkerSafetyOverrideType } from '@prisma/client';
import { PmWorkerSafetyProfileService } from './pm-worker-safety-profile.service';
import { PmWorkerSafetyCailIntelligenceService } from './pm-worker-safety-cail-intelligence.service';
export declare class PmWorkerSafetyProfileController {
    private readonly workers;
    private readonly cail;
    constructor(workers: PmWorkerSafetyProfileService, cail: PmWorkerSafetyCailIntelligenceService);
    getProfile(workerId: string, projectId?: string): Promise<{
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
    }>;
    rebuild(workerId: string, projectId?: string, req?: {
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
        score: import("./worker-scoring.engine").WorkerScoreResult;
    }>;
    evaluateEnforcement(body: {
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
    }): Promise<{
        profileScore: number;
        checks: Record<string, boolean>;
        allowed: boolean;
        action: import(".prisma/client").PmCompanyEnforcementAction;
        violations: string[];
        waived: string[];
    }>;
    listTraining(workerId: string): Promise<{
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
    }[]>;
    listAuthorizations(workerId: string): Promise<{
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
    }[]>;
    listHazardExposure(workerId: string): Promise<{
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
    }[]>;
    listMedical(workerId: string): Promise<{
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
    }[]>;
    addMedical(workerId: string, body: {
        restrictionType: PmWorkerMedicalRestrictionType;
        description: string;
        blocksHighRisk?: boolean;
        blocksConfinedSpace?: boolean;
        blocksHotWork?: boolean;
        blocksEquipment?: boolean;
        expiresAt?: string;
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
    listOverrides(workerId: string): Promise<{
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
    }[]>;
    createOverride(workerId: string, body: {
        overrideType: PmWorkerSafetyOverrideType;
        ruleKey: string;
        reason: string;
        expiresAt: string;
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
    analytics(workerId: string): Promise<{
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
    cailInsights(workerId: string, projectId?: string): Promise<import("./pm-worker-safety-cail-intelligence.service").WorkerCailInsight[]>;
    offlineBundle(workerId: string): Promise<{
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
    }>;
    offlineSyncUpload(workerId: string, body: Record<string, unknown>, req: {
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
    safetyScore(workerId: string, projectId?: string): Promise<{
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
    validateCompliance(workerId: string, projectId?: string): Promise<{
        valid: boolean;
        errors: string[];
        activeMedicalRestrictions: number;
        enforcement: Record<string, unknown>;
    }>;
    upsertTraining(workerId: string, body: Parameters<PmWorkerSafetyProfileService['upsertTrainingSnapshot']>[1], req: {
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
    addAuthorization(workerId: string, body: Parameters<PmWorkerSafetyProfileService['upsertAuthorization']>[1], req: {
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
    recordExposure(workerId: string, body: Parameters<PmWorkerSafetyProfileService['recordHazardExposure']>[1], req: {
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
    linkCapa(workerId: string, body: Parameters<PmWorkerSafetyProfileService['linkCorrectiveAction']>[1], req: {
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
}
