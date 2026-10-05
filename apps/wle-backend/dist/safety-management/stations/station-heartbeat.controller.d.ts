import { StationHeartbeatService } from './station-heartbeat.service';
export declare class StationHeartbeatController {
    private readonly stations;
    constructor(stations: StationHeartbeatService);
    heartbeat(code: string, body: {
        payload?: Record<string, unknown>;
    }): Promise<{
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
    health(siteId?: string): Promise<{
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
    history(stationId: string): Promise<{
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
}
