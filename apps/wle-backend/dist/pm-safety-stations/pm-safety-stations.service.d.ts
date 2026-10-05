import { PmSafetyStationAccessAction, PmSafetyStationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmSiteAccessControlService } from '../pm-site-access-control/pm-site-access-control.service';
import { PmEquipmentSafetyService } from '../pm-equipment-safety/pm-equipment-safety.service';
import { PmEmergencyResponseService } from '../pm-emergency-response/pm-emergency-response.service';
import { PmDocumentControlService } from '../pm-document-control/pm-document-control.service';
import { PmSafetyStationsCailIntelligenceService } from './pm-safety-stations-cail-intelligence.service';
export declare class PmSafetyStationsService {
    private readonly prisma;
    private readonly cail;
    private readonly siteAccess?;
    private readonly equipmentSafety?;
    private readonly emergency?;
    private readonly documents?;
    private readonly registrationEngine;
    private readonly heartbeatEngine;
    private readonly jhaEngine;
    constructor(prisma: PrismaService, cail: PmSafetyStationsCailIntelligenceService, siteAccess?: PmSiteAccessControlService, equipmentSafety?: PmEquipmentSafetyService, emergency?: PmEmergencyResponseService, documents?: PmDocumentControlService);
    private audit;
    resolveStation(stationId?: number, code?: string, hardwareId?: string): Promise<{
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    register(input: {
        name: string;
        code: string;
        companyId: number;
        projectId?: number;
        siteId?: number;
        zoneCode?: string;
        stationType?: import('./station-registration.engine').StationRegistrationInput['stationType'];
        hardwareId?: string;
        firmwareVersion?: string;
        networkMode?: import('./station-registration.engine').StationRegistrationInput['networkMode'];
        equipmentId?: number;
        latitude?: number;
        longitude?: number;
        heartbeatIntervalSec?: number;
        actorId?: number;
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activate(stationId: number, actorId?: number): Promise<{
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivate(stationId: number, actorId?: number): Promise<{
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(filters: {
        companyId: number;
        projectId?: number;
        siteId?: number;
        stationType?: string;
        status?: PmSafetyStationStatus;
    }): Promise<({
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    recordHeartbeat(stationCode: string, payload?: HeartbeatPayload & {
        payload?: Record<string, unknown>;
    }): Promise<{
        stationId: number;
        lastPing: string;
        ok: boolean;
        alerts: import("./station-heartbeat.engine").HeartbeatAlert[];
        healthy: boolean;
    }>;
    stationHealth(projectId?: number, siteId?: number): Promise<{
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
    listHeartbeats(stationId: number, limit?: number): Promise<{
        id: string;
        stationId: number;
        payload: Prisma.JsonValue | null;
        batteryLevel: number | null;
        storageFreeMb: number | null;
        sensorHealthJson: Prisma.JsonValue;
        firmwareVersion: string | null;
        alertsJson: Prisma.JsonValue;
        online: boolean;
        createdAt: Date;
    }[]>;
    validateWorker(input: {
        stationId?: number;
        stationCode?: string;
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
        action?: PmSafetyStationAccessAction;
        actorId?: number;
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
            denialReasons: Prisma.JsonValue;
            checksJson: Prisma.JsonValue;
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
            denialReasons: Prisma.JsonValue;
            checksJson: Prisma.JsonValue;
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
    private writeAccessLog;
    validateEquipment(input: {
        stationId?: number;
        stationCode?: string;
        equipmentId: number;
        workerId?: number;
        projectId?: number;
        actorId?: number;
        clientSyncId?: string;
    }): Promise<{
        granted: boolean;
        log: {
            id: string;
            stationId: number;
            equipmentId: number;
            workerId: number | null;
            granted: boolean;
            denialReasons: Prisma.JsonValue;
            checksJson: Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
        };
        denialReasons: string[];
        checks: Record<string, boolean>;
    }>;
    musterCheckIn(input: {
        stationId?: number;
        stationCode?: string;
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
            geoJson: Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
        };
        musterEventId: string;
    }>;
    musterStatus(projectId: number): Promise<{
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
    setEmergencyMode(stationId: number, active: boolean, actorId?: number): Promise<{
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    emergencyPayload(stationId: number): Promise<{
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
                    geoJson: Prisma.JsonValue | null;
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
                expectedWorkerIds: Prisma.JsonValue;
                missingWorkerIds: Prisma.JsonValue;
                dangerZoneWorkerIds: Prisma.JsonValue;
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
                timelineJson: Prisma.JsonValue;
                responseActionsJson: Prisma.JsonValue;
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
    buildOfflineBundle(stationId: number): Promise<{
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
            requiresTrainingCodes: Prisma.JsonValue;
            requiresOrientation: boolean;
            requiresJha: boolean;
            requiresSdsAck: boolean;
            requiresPermitIds: Prisma.JsonValue;
            requiredPpe: Prisma.JsonValue;
            requirementsJson: Prisma.JsonValue;
            equipmentCategoryIds: Prisma.JsonValue;
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
                        geoJson: Prisma.JsonValue | null;
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
                    expectedWorkerIds: Prisma.JsonValue;
                    missingWorkerIds: Prisma.JsonValue;
                    dangerZoneWorkerIds: Prisma.JsonValue;
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
                    timelineJson: Prisma.JsonValue;
                    responseActionsJson: Prisma.JsonValue;
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
                metadataJson: Prisma.JsonValue;
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
                casNumbers: Prisma.JsonValue;
                hazardClasses: Prisma.JsonValue;
                whmisJson: Prisma.JsonValue;
                metadataJson: Prisma.JsonValue;
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
    applyOfflineSync(stationId: number, events: {
        accessLogs?: Array<Record<string, unknown>>;
        equipmentLogs?: Array<Record<string, unknown>>;
        musterLogs?: Array<Record<string, unknown>>;
        attachments?: Array<Record<string, unknown>>;
    }): Promise<Record<string, number>>;
    addAttachment(input: {
        stationId: number;
        entityType: string;
        entityId: string;
        fileName?: string;
        mimeType?: string;
        dataUrl?: string;
        clientSyncId?: string;
    }): Promise<{
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
    mapOperationalState(input: {
        emergencyModeActive: boolean;
        networkMode: string;
        alerts: Array<{
            code: string;
            severity: string;
        }>;
    }): 'online' | 'offline' | 'low_battery' | 'sensor_fault' | 'emergency_mode';
    getStation(id: number): Promise<{
        operationalState: "offline" | "online" | "low_battery" | "sensor_fault" | "emergency_mode";
        lastHeartbeat: {
            id: string;
            stationId: number;
            payload: Prisma.JsonValue | null;
            batteryLevel: number | null;
            storageFreeMb: number | null;
            sensorHealthJson: Prisma.JsonValue;
            firmwareVersion: string | null;
            alertsJson: Prisma.JsonValue;
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
        metadataJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    analytics(projectId: number): Promise<{
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
    accessLogs(filters: {
        stationId?: number;
        projectId?: number;
        workerId?: number;
        limit?: number;
    }): Promise<({
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
        denialReasons: Prisma.JsonValue;
        checksJson: Prisma.JsonValue;
        accessAttemptId: string | null;
        jhaFlhaId: string | null;
        clientSyncId: string | null;
        createdAt: Date;
    })[]>;
    equipmentLogs(stationId?: number, limit?: number): Promise<({
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
        denialReasons: Prisma.JsonValue;
        checksJson: Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
    })[]>;
}
type HeartbeatPayload = {
    batteryLevel?: number;
    storageFreeMb?: number;
    sensorHealth?: Record<string, boolean>;
    firmwareVersion?: string;
    online?: boolean;
    payload?: Record<string, unknown>;
};
export {};
