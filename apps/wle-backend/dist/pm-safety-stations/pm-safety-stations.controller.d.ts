import { PmSafetyStationAccessAction } from '@prisma/client';
import { PmSafetyStationsService } from './pm-safety-stations.service';
import { PmSafetyStationsCailIntelligenceService } from './pm-safety-stations-cail-intelligence.service';
export declare class PmSafetyStationsController {
    private readonly stations;
    private readonly cail;
    constructor(stations: PmSafetyStationsService, cail: PmSafetyStationsCailIntelligenceService);
    deviceHeartbeat(code: string, body: {
        batteryLevel?: number;
        storageFreeMb?: number;
        sensorHealth?: Record<string, boolean>;
        firmwareVersion?: string;
        online?: boolean;
        payload?: Record<string, unknown>;
    }): Promise<{
        stationId: number;
        lastPing: string;
        ok: boolean;
        alerts: import("./station-heartbeat.engine").HeartbeatAlert[];
        healthy: boolean;
    }>;
    deviceValidateWorker(body: {
        stationCode: string;
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
        action?: PmSafetyStationAccessAction;
        clientSyncId?: string;
    }): Promise<{
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            workerId: number;
            projectId: number | null;
            zoneCode: string;
            action: import(".prisma/client").$Enums.PmSafetyStationAccessAction;
            granted: boolean;
            decision: string | null;
            denialReasons: import(".prisma/client").Prisma.JsonValue;
            checksJson: import(".prisma/client").Prisma.JsonValue;
            accessAttemptId: string | null;
            jhaFlhaId: string | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks?: undefined;
        requiredPpe?: undefined;
        cail?: undefined;
    } | {
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            workerId: number;
            projectId: number | null;
            zoneCode: string;
            action: import(".prisma/client").$Enums.PmSafetyStationAccessAction;
            granted: boolean;
            decision: string | null;
            denialReasons: import(".prisma/client").Prisma.JsonValue;
            checksJson: import(".prisma/client").Prisma.JsonValue;
            accessAttemptId: string | null;
            jhaFlhaId: string | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks: {
            [x: string]: boolean;
        };
        requiredPpe: string[];
        cail: {
            likelyDenied: boolean;
            probability: number;
            topFactors: string[];
        };
    }>;
    deviceValidateEquipment(body: {
        stationCode: string;
        equipmentId: number;
        workerId?: number;
        projectId?: number;
        clientSyncId?: string;
    }): Promise<{
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            equipmentId: number;
            workerId: number | null;
            granted: boolean;
            denialReasons: import(".prisma/client").Prisma.JsonValue;
            checksJson: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks: Record<string, boolean>;
    }>;
    deviceMusterCheckIn(body: {
        stationCode: string;
        workerId: number;
        musterPointCode?: string;
        geoJson?: Record<string, unknown>;
        clientSyncId?: string;
    }): Promise<{
        log: {
            id: string;
            stationId: number;
            workerId: number;
            musterEventId: string | null;
            action: string;
            musterPointCode: string | null;
            geoJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        musterEventId: string;
    }>;
    deviceOfflineSync(stationId: number, body: {
        accessLogs?: Array<Record<string, unknown>>;
        equipmentLogs?: Array<Record<string, unknown>>;
        musterLogs?: Array<Record<string, unknown>>;
        attachments?: Array<Record<string, unknown>>;
    }): Promise<Record<string, number>>;
    deviceOfflineBundle(stationId: number): Promise<{
        station: {
            id: number;
            code: string;
            zoneCode: string;
            stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        };
        workers: {
            id: number;
            qrToken: string;
            firstName: string;
            lastName: string;
        }[];
        equipment: {
            id: number;
            qrToken: string;
            name: string;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        }[];
        jha: {
            activeJhas: {
                id: string;
                status: import(".prisma/client").$Enums.JhaFlhaStatus;
                signatures: {
                    role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
                    signedAt: Date;
                    signerUserId: number;
                }[];
                kind: import(".prisma/client").$Enums.JhaFlhaKind;
                workers: {
                    workerId: number;
                }[];
                approvedAt: Date;
                taskDescription: string;
            }[];
            zoneJhaRules: {
                zoneCode: string;
                requiresFlhaHours: number;
                requiresJha: boolean;
            }[];
        };
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
        emergency: {
            plans: any[];
            lock: any;
            emergencyModeActive?: undefined;
        } | {
            plans: any[] | {
                generatedAt: string;
                activeMuster: {
                    checkins: ({
                        worker: {
                            id: number;
                            firstName: string;
                            lastName: string;
                        };
                    } & {
                        id: string;
                        musterEventId: string;
                        workerId: number;
                        checkedInAt: Date;
                        checkedOutAt: Date | null;
                        method: string;
                        musterPointCode: string | null;
                        identityVerified: boolean;
                        supervisorOverride: boolean;
                        geoJson: import(".prisma/client").Prisma.JsonValue | null;
                        clientSyncId: string | null;
                    })[];
                } & {
                    id: string;
                    companyId: number;
                    siteId: number;
                    projectId: number | null;
                    emergencyEventId: string | null;
                    status: import(".prisma/client").$Enums.MusterEventStatus;
                    evacuationPhase: string;
                    musterPointCode: string | null;
                    siteAccessLocked: boolean;
                    triggeredAt: Date;
                    triggeredByUser: number | null;
                    allClearAt: Date | null;
                    supervisorConfirmedAt: Date | null;
                    notes: string | null;
                    expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
                    missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
                    dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
                    clientSyncId: string | null;
                };
                activeEvents: {
                    id: string;
                    companyId: number;
                    projectId: number | null;
                    siteId: number;
                    eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
                    status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
                    title: string;
                    description: string | null;
                    classification: string | null;
                    timelineJson: import(".prisma/client").Prisma.JsonValue;
                    responseActionsJson: import(".prisma/client").Prisma.JsonValue;
                    safetyEventId: string | null;
                    requiresSupervisorReview: boolean;
                    supervisorReviewedAt: Date | null;
                    declaredAt: Date;
                    declaredByUserId: number | null;
                    allClearAt: Date | null;
                    closedAt: Date | null;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
            };
            lock: {
                id: string;
                projectId: number;
                emergencyEventId: string;
                active: boolean;
                lockedAt: Date;
                unlockedAt: Date | null;
            };
            emergencyModeActive: boolean;
        };
        sds: {
            emergencyPlans: {
                id: string;
                companyId: number;
                projectId: number | null;
                documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
                title: string;
                description: string | null;
                versionNum: number;
                status: import(".prisma/client").$Enums.PmDocumentStatus;
                storageKey: string | null;
                metadataJson: import(".prisma/client").Prisma.JsonValue;
                equipmentId: number | null;
                requiresAck: boolean;
                requiresAckForAccess: boolean;
                reviewDueAt: Date | null;
                publishedAt: Date | null;
                supersededById: string | null;
                parentDocumentId: string | null;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            sds: ({
                attachments: {
                    id: string;
                    sdsDocumentId: string;
                    storageKey: string | null;
                    fileName: string | null;
                    mimeType: string | null;
                    dataUrl: string | null;
                    coreFileId: number | null;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                productName: string;
                manufacturer: string | null;
                category: import(".prisma/client").$Enums.PmSdsCategory;
                status: import(".prisma/client").$Enums.PmDocumentStatus;
                version: number;
                parentDocumentId: string | null;
                casNumbers: import(".prisma/client").Prisma.JsonValue;
                hazardClasses: import(".prisma/client").Prisma.JsonValue;
                whmisJson: import(".prisma/client").Prisma.JsonValue;
                metadataJson: import(".prisma/client").Prisma.JsonValue;
                storageKey: string | null;
                revisionDate: Date | null;
                expiresAt: Date | null;
                reviewDueAt: Date | null;
                requiresAck: boolean;
                publishedAt: Date | null;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            siteId: number;
            generatedAt: string;
        } | {
            documents: any[];
        };
        syncedAt: string;
    }>;
    register(body: Parameters<PmSafetyStationsService['register']>[0], req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        equipmentId: number | null;
        code: string | null;
        hardwareId: string | null;
        name: string;
        location: string | null;
        zoneCode: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        networkMode: import(".prisma/client").$Enums.PmSafetyStationNetworkMode;
        firmwareVersion: string | null;
        latitude: number | null;
        longitude: number | null;
        heartbeatIntervalSec: number;
        emergencyModeActive: boolean;
        purpose: string | null;
        type: string;
        active: boolean;
        lastPing: Date | null;
        lastSyncAt: Date | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activate(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        equipmentId: number | null;
        code: string | null;
        hardwareId: string | null;
        name: string;
        location: string | null;
        zoneCode: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        networkMode: import(".prisma/client").$Enums.PmSafetyStationNetworkMode;
        firmwareVersion: string | null;
        latitude: number | null;
        longitude: number | null;
        heartbeatIntervalSec: number;
        emergencyModeActive: boolean;
        purpose: string | null;
        type: string;
        active: boolean;
        lastPing: Date | null;
        lastSyncAt: Date | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivate(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        equipmentId: number | null;
        code: string | null;
        hardwareId: string | null;
        name: string;
        location: string | null;
        zoneCode: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        networkMode: import(".prisma/client").$Enums.PmSafetyStationNetworkMode;
        firmwareVersion: string | null;
        latitude: number | null;
        longitude: number | null;
        heartbeatIntervalSec: number;
        emergencyModeActive: boolean;
        purpose: string | null;
        type: string;
        active: boolean;
        lastPing: Date | null;
        lastSyncAt: Date | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(companyId: string, projectId?: string, siteId?: string, stationType?: string): Promise<({
        site: {
            id: number;
            name: string;
            code: string | null;
            region: string | null;
            latitude: number | null;
            longitude: number | null;
            active: boolean;
            createdAt: Date;
        };
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            companyId: number;
            siteId: number | null;
            name: string;
            code: string | null;
            client: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
            createdAt: Date;
        };
    } & {
        id: number;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        equipmentId: number | null;
        code: string | null;
        hardwareId: string | null;
        name: string;
        location: string | null;
        zoneCode: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        networkMode: import(".prisma/client").$Enums.PmSafetyStationNetworkMode;
        firmwareVersion: string | null;
        latitude: number | null;
        longitude: number | null;
        heartbeatIntervalSec: number;
        emergencyModeActive: boolean;
        purpose: string | null;
        type: string;
        active: boolean;
        lastPing: Date | null;
        lastSyncAt: Date | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    health(projectId?: string, siteId?: string): Promise<{
        healthy: boolean;
        alerts: import("./station-heartbeat.engine").HeartbeatAlert[];
        batteryLevel: number;
        id: number;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        name: string;
        code: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        heartbeatIntervalSec: number;
        lastPing: Date;
    }[]>;
    validateWorker(body: Parameters<PmSafetyStationsService['validateWorker']>[0], req: {
        user: {
            id: number;
        };
    }): Promise<{
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            workerId: number;
            projectId: number | null;
            zoneCode: string;
            action: import(".prisma/client").$Enums.PmSafetyStationAccessAction;
            granted: boolean;
            decision: string | null;
            denialReasons: import(".prisma/client").Prisma.JsonValue;
            checksJson: import(".prisma/client").Prisma.JsonValue;
            accessAttemptId: string | null;
            jhaFlhaId: string | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks?: undefined;
        requiredPpe?: undefined;
        cail?: undefined;
    } | {
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            workerId: number;
            projectId: number | null;
            zoneCode: string;
            action: import(".prisma/client").$Enums.PmSafetyStationAccessAction;
            granted: boolean;
            decision: string | null;
            denialReasons: import(".prisma/client").Prisma.JsonValue;
            checksJson: import(".prisma/client").Prisma.JsonValue;
            accessAttemptId: string | null;
            jhaFlhaId: string | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks: {
            [x: string]: boolean;
        };
        requiredPpe: string[];
        cail: {
            likelyDenied: boolean;
            probability: number;
            topFactors: string[];
        };
    }>;
    validateEquipment(body: Parameters<PmSafetyStationsService['validateEquipment']>[0], req: {
        user: {
            id: number;
        };
    }): Promise<{
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            equipmentId: number;
            workerId: number | null;
            granted: boolean;
            denialReasons: import(".prisma/client").Prisma.JsonValue;
            checksJson: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks: Record<string, boolean>;
    }>;
    musterCheckIn(body: Parameters<PmSafetyStationsService['musterCheckIn']>[0]): Promise<{
        log: {
            id: string;
            stationId: number;
            workerId: number;
            musterEventId: string | null;
            action: string;
            musterPointCode: string | null;
            geoJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        musterEventId: string;
    }>;
    musterStatus(projectId: string): Promise<{
        active: boolean;
        musterEventId?: undefined;
        checkedIn?: undefined;
        missingWorkerIds?: undefined;
    } | {
        active: boolean;
        musterEventId: string;
        checkedIn: number;
        missingWorkerIds: number[];
    }>;
    emergencyMode(id: number, body: {
        active: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        equipmentId: number | null;
        code: string | null;
        hardwareId: string | null;
        name: string;
        location: string | null;
        zoneCode: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        networkMode: import(".prisma/client").$Enums.PmSafetyStationNetworkMode;
        firmwareVersion: string | null;
        latitude: number | null;
        longitude: number | null;
        heartbeatIntervalSec: number;
        emergencyModeActive: boolean;
        purpose: string | null;
        type: string;
        active: boolean;
        lastPing: Date | null;
        lastSyncAt: Date | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    emergencyPayload(id: number): Promise<{
        plans: any[];
        lock: any;
        emergencyModeActive?: undefined;
    } | {
        plans: any[] | {
            generatedAt: string;
            activeMuster: {
                checkins: ({
                    worker: {
                        id: number;
                        firstName: string;
                        lastName: string;
                    };
                } & {
                    id: string;
                    musterEventId: string;
                    workerId: number;
                    checkedInAt: Date;
                    checkedOutAt: Date | null;
                    method: string;
                    musterPointCode: string | null;
                    identityVerified: boolean;
                    supervisorOverride: boolean;
                    geoJson: import(".prisma/client").Prisma.JsonValue | null;
                    clientSyncId: string | null;
                })[];
            } & {
                id: string;
                companyId: number;
                siteId: number;
                projectId: number | null;
                emergencyEventId: string | null;
                status: import(".prisma/client").$Enums.MusterEventStatus;
                evacuationPhase: string;
                musterPointCode: string | null;
                siteAccessLocked: boolean;
                triggeredAt: Date;
                triggeredByUser: number | null;
                allClearAt: Date | null;
                supervisorConfirmedAt: Date | null;
                notes: string | null;
                expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
                missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
                dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
                clientSyncId: string | null;
            };
            activeEvents: {
                id: string;
                companyId: number;
                projectId: number | null;
                siteId: number;
                eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
                status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
                title: string;
                description: string | null;
                classification: string | null;
                timelineJson: import(".prisma/client").Prisma.JsonValue;
                responseActionsJson: import(".prisma/client").Prisma.JsonValue;
                safetyEventId: string | null;
                requiresSupervisorReview: boolean;
                supervisorReviewedAt: Date | null;
                declaredAt: Date;
                declaredByUserId: number | null;
                allClearAt: Date | null;
                closedAt: Date | null;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        };
        lock: {
            id: string;
            projectId: number;
            emergencyEventId: string;
            active: boolean;
            lockedAt: Date;
            unlockedAt: Date | null;
        };
        emergencyModeActive: boolean;
    }>;
    offlineBundle(id: number): Promise<{
        station: {
            id: number;
            code: string;
            zoneCode: string;
            stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        };
        workers: {
            id: number;
            qrToken: string;
            firstName: string;
            lastName: string;
        }[];
        equipment: {
            id: number;
            qrToken: string;
            name: string;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        }[];
        jha: {
            activeJhas: {
                id: string;
                status: import(".prisma/client").$Enums.JhaFlhaStatus;
                signatures: {
                    role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
                    signedAt: Date;
                    signerUserId: number;
                }[];
                kind: import(".prisma/client").$Enums.JhaFlhaKind;
                workers: {
                    workerId: number;
                }[];
                approvedAt: Date;
                taskDescription: string;
            }[];
            zoneJhaRules: {
                zoneCode: string;
                requiresFlhaHours: number;
                requiresJha: boolean;
            }[];
        };
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
        emergency: {
            plans: any[];
            lock: any;
            emergencyModeActive?: undefined;
        } | {
            plans: any[] | {
                generatedAt: string;
                activeMuster: {
                    checkins: ({
                        worker: {
                            id: number;
                            firstName: string;
                            lastName: string;
                        };
                    } & {
                        id: string;
                        musterEventId: string;
                        workerId: number;
                        checkedInAt: Date;
                        checkedOutAt: Date | null;
                        method: string;
                        musterPointCode: string | null;
                        identityVerified: boolean;
                        supervisorOverride: boolean;
                        geoJson: import(".prisma/client").Prisma.JsonValue | null;
                        clientSyncId: string | null;
                    })[];
                } & {
                    id: string;
                    companyId: number;
                    siteId: number;
                    projectId: number | null;
                    emergencyEventId: string | null;
                    status: import(".prisma/client").$Enums.MusterEventStatus;
                    evacuationPhase: string;
                    musterPointCode: string | null;
                    siteAccessLocked: boolean;
                    triggeredAt: Date;
                    triggeredByUser: number | null;
                    allClearAt: Date | null;
                    supervisorConfirmedAt: Date | null;
                    notes: string | null;
                    expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
                    missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
                    dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
                    clientSyncId: string | null;
                };
                activeEvents: {
                    id: string;
                    companyId: number;
                    projectId: number | null;
                    siteId: number;
                    eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
                    status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
                    title: string;
                    description: string | null;
                    classification: string | null;
                    timelineJson: import(".prisma/client").Prisma.JsonValue;
                    responseActionsJson: import(".prisma/client").Prisma.JsonValue;
                    safetyEventId: string | null;
                    requiresSupervisorReview: boolean;
                    supervisorReviewedAt: Date | null;
                    declaredAt: Date;
                    declaredByUserId: number | null;
                    allClearAt: Date | null;
                    closedAt: Date | null;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
            };
            lock: {
                id: string;
                projectId: number;
                emergencyEventId: string;
                active: boolean;
                lockedAt: Date;
                unlockedAt: Date | null;
            };
            emergencyModeActive: boolean;
        };
        sds: {
            emergencyPlans: {
                id: string;
                companyId: number;
                projectId: number | null;
                documentType: import(".prisma/client").$Enums.PmControlledDocumentType;
                title: string;
                description: string | null;
                versionNum: number;
                status: import(".prisma/client").$Enums.PmDocumentStatus;
                storageKey: string | null;
                metadataJson: import(".prisma/client").Prisma.JsonValue;
                equipmentId: number | null;
                requiresAck: boolean;
                requiresAckForAccess: boolean;
                reviewDueAt: Date | null;
                publishedAt: Date | null;
                supersededById: string | null;
                parentDocumentId: string | null;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            sds: ({
                attachments: {
                    id: string;
                    sdsDocumentId: string;
                    storageKey: string | null;
                    fileName: string | null;
                    mimeType: string | null;
                    dataUrl: string | null;
                    coreFileId: number | null;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                productName: string;
                manufacturer: string | null;
                category: import(".prisma/client").$Enums.PmSdsCategory;
                status: import(".prisma/client").$Enums.PmDocumentStatus;
                version: number;
                parentDocumentId: string | null;
                casNumbers: import(".prisma/client").Prisma.JsonValue;
                hazardClasses: import(".prisma/client").Prisma.JsonValue;
                whmisJson: import(".prisma/client").Prisma.JsonValue;
                metadataJson: import(".prisma/client").Prisma.JsonValue;
                storageKey: string | null;
                revisionDate: Date | null;
                expiresAt: Date | null;
                reviewDueAt: Date | null;
                requiresAck: boolean;
                publishedAt: Date | null;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            siteId: number;
            generatedAt: string;
        } | {
            documents: any[];
        };
        syncedAt: string;
    }>;
    offlineSync(id: number, body: Parameters<PmSafetyStationsService['applyOfflineSync']>[1]): Promise<Record<string, number>>;
    addAttachment(body: Parameters<PmSafetyStationsService['addAttachment']>[0]): Promise<{
        id: string;
        stationId: number;
        entityType: string;
        entityId: string;
        storageKey: string | null;
        fileName: string | null;
        mimeType: string | null;
        dataUrl: string | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    accessLogs(stationId?: string, projectId?: string, workerId?: string, limit?: string): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        station: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: string;
        stationId: number;
        workerId: number;
        projectId: number | null;
        zoneCode: string;
        action: import(".prisma/client").$Enums.PmSafetyStationAccessAction;
        granted: boolean;
        decision: string | null;
        denialReasons: import(".prisma/client").Prisma.JsonValue;
        checksJson: import(".prisma/client").Prisma.JsonValue;
        accessAttemptId: string | null;
        jhaFlhaId: string | null;
        clientSyncId: string | null;
        createdAt: Date;
    })[]>;
    equipmentLogs(stationId?: string, limit?: string): Promise<({
        equipment: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        stationId: number;
        equipmentId: number;
        workerId: number | null;
        granted: boolean;
        denialReasons: import(".prisma/client").Prisma.JsonValue;
        checksJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
    })[]>;
    analytics(projectId: string): Promise<{
        access: {
            granted: number;
            denied: number;
            total: number;
        };
        equipmentValidations: number;
        musterCheckins: number;
        stationUptimePct: number;
        stations: number;
        denialRate: number;
        syncSuccessRate: number;
        musterCompliancePct: number;
        cailInsights: import("./pm-safety-stations-cail-intelligence.service").StationCailInsight[];
    }>;
    cailInsights(projectId: string): Promise<import("./pm-safety-stations-cail-intelligence.service").StationCailInsight[]>;
    getStation(id: number): Promise<{
        operationalState: "offline" | "online" | "low_battery" | "sensor_fault" | "emergency_mode";
        lastHeartbeat: {
            id: string;
            stationId: number;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            batteryLevel: number | null;
            storageFreeMb: number | null;
            sensorHealthJson: import(".prisma/client").Prisma.JsonValue;
            firmwareVersion: string | null;
            alertsJson: import(".prisma/client").Prisma.JsonValue;
            online: boolean;
            createdAt: Date;
        };
        healthy: boolean;
        id: number;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        equipmentId: number | null;
        code: string | null;
        hardwareId: string | null;
        name: string;
        location: string | null;
        zoneCode: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        networkMode: import(".prisma/client").$Enums.PmSafetyStationNetworkMode;
        firmwareVersion: string | null;
        latitude: number | null;
        longitude: number | null;
        heartbeatIntervalSec: number;
        emergencyModeActive: boolean;
        purpose: string | null;
        type: string;
        active: boolean;
        lastPing: Date | null;
        lastSyncAt: Date | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    predict(id: number, workerId?: string): Promise<{
        stationId: number;
    } | {
        insights: import("./pm-safety-stations-cail-intelligence.service").StationCailInsight[];
        workerRiskScore: number;
        zoneRiskScore: number;
        predictiveAccessDenial: number;
        stationId: number;
    }>;
    heartbeats(stationId: number, limit?: string): Promise<{
        id: string;
        stationId: number;
        payload: import(".prisma/client").Prisma.JsonValue | null;
        batteryLevel: number | null;
        storageFreeMb: number | null;
        sensorHealthJson: import(".prisma/client").Prisma.JsonValue;
        firmwareVersion: string | null;
        alertsJson: import(".prisma/client").Prisma.JsonValue;
        online: boolean;
        createdAt: Date;
    }[]>;
    heartbeat(code: string, body: Record<string, unknown>): Promise<{
        stationId: number;
        lastPing: string;
        ok: boolean;
        alerts: import("./station-heartbeat.engine").HeartbeatAlert[];
        healthy: boolean;
    }>;
}
