import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PmSafetyStationsService } from '../../pm-safety-stations/pm-safety-stations.service';
export declare class StationHeartbeatService {
    private readonly prisma;
    private readonly pmStations?;
    constructor(prisma: PrismaService, pmStations?: PmSafetyStationsService);
    recordHeartbeat(stationCode: string, payload?: Record<string, unknown>): Promise<{
        stationId: number;
        lastPing: string;
        ok: boolean;
        alerts: import("../../pm-safety-stations/station-heartbeat.engine").HeartbeatAlert[];
        healthy: boolean;
    } | {
        stationId: number;
        lastPing: string;
        ok: boolean;
    }>;
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
    stationHealth(siteId?: number): Promise<{
        healthy: boolean;
        alerts: import("../../pm-safety-stations/station-heartbeat.engine").HeartbeatAlert[];
        batteryLevel: number;
        id: number;
        status: import(".prisma/client").$Enums.PmSafetyStationStatus;
        name: string;
        code: string;
        stationType: import(".prisma/client").$Enums.PmSafetyStationType;
        heartbeatIntervalSec: number;
        lastPing: Date;
    }[] | {
        healthy: boolean;
        minutesSincePing: number;
        id: number;
        name: string;
        siteId: number;
        code: string;
        lastPing: Date;
    }[]>;
}
