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

export class StationHeartbeatEngine {
  evaluateAlerts(input: {
    lastPing: Date | null;
    heartbeatIntervalSec: number;
    batteryLevel?: number | null;
    sensorHealth?: Record<string, boolean>;
    expectedFirmware?: string | null;
    reportedFirmware?: string | null;
  }): HeartbeatAlert[] {
    const alerts: HeartbeatAlert[] = [];
    const staleMs = (input.heartbeatIntervalSec || 60) * 3 * 1000;
    const now = Date.now();

    if (!input.lastPing || now - input.lastPing.getTime() > staleMs) {
      alerts.push({
        code: 'station_offline',
        severity: 'critical',
        message: 'Station heartbeat stale or missing',
      });
    }

    if (input.batteryLevel != null && input.batteryLevel < 20) {
      alerts.push({
        code: 'low_battery',
        severity: 'warning',
        message: `Battery at ${input.batteryLevel}%`,
      });
    }

    if (input.sensorHealth) {
      for (const [key, ok] of Object.entries(input.sensorHealth)) {
        if (!ok) {
          alerts.push({
            code: 'sensor_failure',
            severity: 'critical',
            message: `Sensor unhealthy: ${key}`,
          });
        }
      }
    }

    if (
      input.expectedFirmware &&
      input.reportedFirmware &&
      input.expectedFirmware !== input.reportedFirmware
    ) {
      alerts.push({
        code: 'firmware_mismatch',
        severity: 'warning',
        message: `Firmware ${input.reportedFirmware} != expected ${input.expectedFirmware}`,
      });
    }

    return alerts;
  }

  isHealthy(alerts: HeartbeatAlert[]): boolean {
    return !alerts.some((a) => a.severity === 'critical');
  }
}
