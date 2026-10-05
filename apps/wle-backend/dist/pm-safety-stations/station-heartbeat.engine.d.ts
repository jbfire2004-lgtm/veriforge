export type HeartbeatPayload = {
    batteryLevel?: number;
    storageFreeMb?: number;
    sensorHealth?: Record<string, boolean>;
    firmwareVersion?: string;
    online?: boolean;
};
export type HeartbeatAlert = {
    code: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
};
export declare class StationHeartbeatEngine {
    evaluateAlerts(input: {
        lastPing: Date | null;
        heartbeatIntervalSec: number;
        batteryLevel?: number | null;
        sensorHealth?: Record<string, boolean>;
        expectedFirmware?: string | null;
        reportedFirmware?: string | null;
    }): HeartbeatAlert[];
    isHealthy(alerts: HeartbeatAlert[]): boolean;
}
