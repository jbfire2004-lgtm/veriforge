import { PmSafetyStationAccessAction } from '@prisma/client';
import { PmSafetyStationsService } from './pm-safety-stations.service';
import { PmSafetyStationsCailIntelligenceService } from './pm-safety-stations-cail-intelligence.service';
export declare class PmStationController {
    private readonly stations;
    private readonly cail;
    constructor(stations: PmSafetyStationsService, cail: PmSafetyStationsCailIntelligenceService);
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
    heartbeat(body: {
        stationCode: string;
        batteryLevel?: number;
        storageFreeMb?: number;
        sensorHealth?: Record<string, boolean>;
        firmwareVersion?: string;
        online?: boolean;
    }): Promise<{
        stationId: number;
        lastPing: string;
        ok: boolean;
        alerts: import("./station-heartbeat.engine").HeartbeatAlert[];
        healthy: boolean;
    }>;
    validateWorker(body: {
        stationCode?: string;
        stationId?: number;
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
        action?: PmSafetyStationAccessAction;
        clientSyncId?: string;
    }, req: {
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
    validateEquipment(body: {
        stationCode?: string;
        stationId?: number;
        equipmentId: number;
        workerId?: number;
        projectId?: number;
        clientSyncId?: string;
    }, req: {
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
    emergencyMode(body: {
        stationId: number;
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
    offlineSync(body: {
        stationId: number;
        accessLogs?: Array<Record<string, unknown>>;
        equipmentLogs?: Array<Record<string, unknown>>;
        musterLogs?: Array<Record<string, unknown>>;
        attachments?: Array<Record<string, unknown>>;
    }): Promise<Record<string, number>>;
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
}
