import { PmUnifiedHcIngestSource } from '@prisma/client';
import { PmUnifiedHazardControlService } from './pm-unified-hazard-control.service';
import { PmUnifiedHazardControlCailService } from './pm-unified-hazard-control-cail.service';
export declare class PmHazardController {
    private readonly hc;
    private readonly cail;
    constructor(hc: PmUnifiedHazardControlService, cail: PmUnifiedHazardControlCailService);
    createHazard(body: {
        companyId: number;
    } & Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        hazard: {
            energySources: {
                id: string;
                hazardId: string;
                energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                exposureLevel: number;
                highEnergyFlag: boolean;
                severityScore: number;
                autoDetected: boolean;
            }[];
            controlLinks: {
                id: string;
                hazardId: string;
                controlId: string;
                effectivenessScore: number | null;
                required: boolean;
                verified: boolean;
            }[];
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            workPackageId: string | null;
            taskId: string | null;
            workerId: number | null;
            parentHazardId: string | null;
            scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
            hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
            category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
            subcategory: string | null;
            title: string;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            sifPotential: boolean;
            hecaCategoryKey: string | null;
            sifScore: number | null;
            supervisorReviewRequired: boolean;
            requiredTraining: import(".prisma/client").Prisma.JsonValue;
            requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
            requiredPpe: import(".prisma/client").Prisma.JsonValue;
            requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
            sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
            sourceId: string | null;
            legacyCompanyHazardId: string | null;
            legacyProjectHazardId: string | null;
            version: number;
            status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
            publishedAt: Date | null;
            active: boolean;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        sifHeca: import("./sif-heca-scoring.engine").SifHecaResult;
    }>;
    ingest(body: {
        companyId: number;
        source: PmUnifiedHcIngestSource;
        projectId?: number;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        source: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
        created: string[];
        skipped: string[];
        count: number;
    }>;
    mapControls(body: {
        hazardId: string;
        controlId: string;
        effectivenessScore?: number;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        hazardId: string;
        controlId: string;
        effectivenessScore: number | null;
        required: boolean;
        verified: boolean;
    }>;
    scoreSif(body: {
        hazardId: string;
    }): Promise<import("./sif-heca-scoring.engine").SifHecaResult>;
    offlineSync(body: {
        companyId: number;
        projectId?: number;
        hazards?: Array<Record<string, unknown>>;
        controls?: Array<Record<string, unknown>>;
        mappings?: Array<{
            hazardId: string;
            controlId: string;
            effectivenessScore?: number;
        }>;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        ok: boolean;
        applied: {
            hazards: number;
            controls: number;
            mappings: number;
        };
        serverState: {
            syncedAt: string;
            hazards: ({
                energySources: {
                    id: string;
                    hazardId: string;
                    energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                    exposureLevel: number;
                    highEnergyFlag: boolean;
                    severityScore: number;
                    autoDetected: boolean;
                }[];
                controlLinks: ({
                    control: {
                        id: string;
                        companyId: number;
                        projectId: number | null;
                        workPackageId: string | null;
                        taskId: string | null;
                        parentControlId: string | null;
                        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                        controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                        title: string;
                        description: string;
                        controlStrength: number;
                        hierarchyLevel: number;
                        requiredTraining: import(".prisma/client").Prisma.JsonValue;
                        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                        requiredPpe: import(".prisma/client").Prisma.JsonValue;
                        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
                        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                        sourceId: string | null;
                        legacyCompanyControlId: string | null;
                        legacyProjectControlId: string | null;
                        version: number;
                        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                        publishedAt: Date | null;
                        active: boolean;
                        clientSyncId: string | null;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    hazardId: string;
                    controlId: string;
                    effectivenessScore: number | null;
                    required: boolean;
                    verified: boolean;
                })[];
                trainingReqs: {
                    id: string;
                    hazardId: string;
                    trainingCode: string;
                    required: boolean;
                }[];
                ppeReqs: {
                    id: string;
                    hazardId: string;
                    ppeType: string;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                workPackageId: string | null;
                taskId: string | null;
                workerId: number | null;
                parentHazardId: string | null;
                scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
                category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
                subcategory: string | null;
                title: string;
                description: string;
                severity: number;
                likelihood: number;
                riskScore: number;
                sifPotential: boolean;
                hecaCategoryKey: string | null;
                sifScore: number | null;
                supervisorReviewRequired: boolean;
                requiredTraining: import(".prisma/client").Prisma.JsonValue;
                requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                requiredPpe: import(".prisma/client").Prisma.JsonValue;
                requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
                sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                sourceId: string | null;
                legacyCompanyHazardId: string | null;
                legacyProjectHazardId: string | null;
                version: number;
                status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                publishedAt: Date | null;
                active: boolean;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            controls: ({
                verifications: {
                    id: string;
                    controlId: string;
                    stepOrder: number;
                    description: string;
                    verifiedAt: Date | null;
                    verifiedById: number | null;
                }[];
                hazardLinks: {
                    id: string;
                    hazardId: string;
                    controlId: string;
                    effectivenessScore: number | null;
                    required: boolean;
                    verified: boolean;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                workPackageId: string | null;
                taskId: string | null;
                parentControlId: string | null;
                scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                title: string;
                description: string;
                controlStrength: number;
                hierarchyLevel: number;
                requiredTraining: import(".prisma/client").Prisma.JsonValue;
                requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                requiredPpe: import(".prisma/client").Prisma.JsonValue;
                requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
                sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                sourceId: string | null;
                legacyCompanyControlId: string | null;
                legacyProjectControlId: string | null;
                version: number;
                status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                publishedAt: Date | null;
                active: boolean;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            energyWheel: {
                id: string;
                hazardId: string;
                energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                exposureLevel: number;
                highEnergyFlag: boolean;
                severityScore: number;
                autoDetected: boolean;
            }[];
            projectSafety: {
                context: {
                    projectId: number;
                    ownerCompanyId: number;
                    companyName: string;
                    siteIds: number[];
                    siteName: string;
                    profile: {
                        id: string;
                        version: number;
                        status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                        riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
                        requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
                        requiredTraining: import(".prisma/client").Prisma.JsonValue;
                        enforcementRules: import(".prisma/client").Prisma.JsonValue;
                        publishedAt: string;
                        completenessScore: number;
                    };
                    hazardLibraryCount: number;
                    controlLibraryCount: number;
                    zoneRules: {
                        id: string;
                        companyId: number | null;
                        projectId: number;
                        accessPointId: string | null;
                        zoneCode: string;
                        zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
                        requiresFlhaHours: number;
                        requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
                        requiresOrientation: boolean;
                        requiresJha: boolean;
                        requiresSdsAck: boolean;
                        requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
                        requiredPpe: import(".prisma/client").Prisma.JsonValue;
                        requirementsJson: import(".prisma/client").Prisma.JsonValue;
                        equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
                        timeWindowStart: string | null;
                        timeWindowEnd: string | null;
                        highRisk: boolean;
                        active: boolean;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                    openCailCount: number;
                    riskSnapshot: {
                        score: number;
                        band: string;
                        computedAt: string;
                    };
                    cailInsights: import("../pm-project-safety-context/pm-project-safety-cail-intelligence.service").ProjectSafetyCailInsight[];
                    integrations: {
                        jhaFlha: boolean;
                        siteAccess: boolean;
                        safetyStations: boolean;
                        emergency: boolean;
                    };
                };
                profile: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    version: number;
                    status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                    riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
                    projectType: string | null;
                    scopeOfWorkJson: import(".prisma/client").Prisma.JsonValue;
                    requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
                    requiredInspections: import(".prisma/client").Prisma.JsonValue;
                    requiredTraining: import(".prisma/client").Prisma.JsonValue;
                    requiredEquipmentCerts: import(".prisma/client").Prisma.JsonValue;
                    requiredPpe: import(".prisma/client").Prisma.JsonValue;
                    requiredEmergencyPlans: import(".prisma/client").Prisma.JsonValue;
                    requiredSdsAcks: import(".prisma/client").Prisma.JsonValue;
                    requiredToolboxTalks: import(".prisma/client").Prisma.JsonValue;
                    enforcementRulesJson: import(".prisma/client").Prisma.JsonValue;
                    zoneRulesJson: import(".prisma/client").Prisma.JsonValue;
                    equipmentRulesJson: import(".prisma/client").Prisma.JsonValue;
                    trainingRulesJson: import(".prisma/client").Prisma.JsonValue;
                    emergencyRulesJson: import(".prisma/client").Prisma.JsonValue;
                    environmentalJson: import(".prisma/client").Prisma.JsonValue;
                    subcontractorIds: import(".prisma/client").Prisma.JsonValue;
                    autoGenerated: boolean;
                    publishedAt: Date | null;
                    publishedById: number | null;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
                hazards: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    profileId: string | null;
                    category: import(".prisma/client").$Enums.PmProjectHazardCategory;
                    subcategory: string | null;
                    title: string;
                    description: string;
                    severity: number;
                    likelihood: number;
                    sifPotential: boolean;
                    hecaCategoryKey: string | null;
                    requiredControlIds: import(".prisma/client").Prisma.JsonValue;
                    sourceType: string | null;
                    sourceId: string | null;
                    version: number;
                    status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                    publishedAt: Date | null;
                    active: boolean;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                controls: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    profileId: string | null;
                    controlType: import(".prisma/client").$Enums.PmProjectControlType;
                    title: string;
                    description: string;
                    hazardCategoryKeys: import(".prisma/client").Prisma.JsonValue;
                    ppeRequired: boolean;
                    equipmentRuleJson: import(".prisma/client").Prisma.JsonValue;
                    version: number;
                    status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                    publishedAt: Date | null;
                    active: boolean;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                overrides: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    profileId: string | null;
                    ruleType: import(".prisma/client").$Enums.PmProjectSafetyOverrideRuleType;
                    ruleKey: string;
                    overrideJson: import(".prisma/client").Prisma.JsonValue;
                    reason: string;
                    expiresAt: Date | null;
                    approvedById: number | null;
                    active: boolean;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
                zoneRules: {
                    id: string;
                    companyId: number | null;
                    projectId: number;
                    accessPointId: string | null;
                    zoneCode: string;
                    zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
                    requiresFlhaHours: number;
                    requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
                    requiresOrientation: boolean;
                    requiresJha: boolean;
                    requiresSdsAck: boolean;
                    requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
                    requiredPpe: import(".prisma/client").Prisma.JsonValue;
                    requirementsJson: import(".prisma/client").Prisma.JsonValue;
                    equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
                    timeWindowStart: string | null;
                    timeWindowEnd: string | null;
                    highRisk: boolean;
                    active: boolean;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                syncedAt: string;
            };
        };
    }>;
    energyWheel(id: string): Promise<{
        hazardId: string;
        energies: {
            id: string;
            hazardId: string;
            energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
            exposureLevel: number;
            highEnergyFlag: boolean;
            severityScore: number;
            autoDetected: boolean;
        }[];
        autoDetected: import("./energy-wheel.engine").EnergyDetection[];
        suggestedControls: string[];
        aggregateSeverity: number;
    }>;
    suggestControls(id: string): Promise<import("./control-suggestion.engine").ControlSuggestion[]>;
    publish(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        workerId: number | null;
        parentHazardId: string | null;
        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
        hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
        category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
        subcategory: string | null;
        title: string;
        description: string;
        severity: number;
        likelihood: number;
        riskScore: number;
        sifPotential: boolean;
        hecaCategoryKey: string | null;
        sifScore: number | null;
        supervisorReviewRequired: boolean;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
        sourceId: string | null;
        legacyCompanyHazardId: string | null;
        legacyProjectHazardId: string | null;
        version: number;
        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
        publishedAt: Date | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    hazardCail(id: string, companyId: string, projectId?: string): Promise<{
        hazardId: string;
        sifHeca: import("./sif-heca-scoring.engine").SifHecaResult;
        suggestions: import("./control-suggestion.engine").ControlSuggestion[];
        insights: import("./pm-unified-hazard-control-cail.service").HcCailInsight[];
    }>;
    getHazard(id: string): Promise<{
        versions: {
            id: string;
            hazardId: string;
            version: number;
            snapshotJson: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date;
        }[];
        energySources: {
            id: string;
            hazardId: string;
            energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
            exposureLevel: number;
            highEnergyFlag: boolean;
            severityScore: number;
            autoDetected: boolean;
        }[];
        controlLinks: ({
            control: {
                verifications: {
                    id: string;
                    controlId: string;
                    stepOrder: number;
                    description: string;
                    verifiedAt: Date | null;
                    verifiedById: number | null;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                workPackageId: string | null;
                taskId: string | null;
                parentControlId: string | null;
                scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                title: string;
                description: string;
                controlStrength: number;
                hierarchyLevel: number;
                requiredTraining: import(".prisma/client").Prisma.JsonValue;
                requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                requiredPpe: import(".prisma/client").Prisma.JsonValue;
                requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
                sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                sourceId: string | null;
                legacyCompanyControlId: string | null;
                legacyProjectControlId: string | null;
                version: number;
                status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                publishedAt: Date | null;
                active: boolean;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            hazardId: string;
            controlId: string;
            effectivenessScore: number | null;
            required: boolean;
            verified: boolean;
        })[];
        trainingReqs: {
            id: string;
            hazardId: string;
            trainingCode: string;
            required: boolean;
        }[];
        equipmentReqs: {
            id: string;
            hazardId: string;
            equipmentId: number | null;
            equipmentType: string | null;
        }[];
        ppeReqs: {
            id: string;
            hazardId: string;
            ppeType: string;
        }[];
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        workerId: number | null;
        parentHazardId: string | null;
        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
        hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
        category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
        subcategory: string | null;
        title: string;
        description: string;
        severity: number;
        likelihood: number;
        riskScore: number;
        sifPotential: boolean;
        hecaCategoryKey: string | null;
        sifScore: number | null;
        supervisorReviewRequired: boolean;
        requiredTraining: import(".prisma/client").Prisma.JsonValue;
        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
        sourceId: string | null;
        legacyCompanyHazardId: string | null;
        legacyProjectHazardId: string | null;
        version: number;
        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
        publishedAt: Date | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
