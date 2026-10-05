"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationHeartbeatEngine = void 0;
class StationHeartbeatEngine {
    evaluateAlerts(input) {
        const alerts = [];
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
        if (input.expectedFirmware &&
            input.reportedFirmware &&
            input.expectedFirmware !== input.reportedFirmware) {
            alerts.push({
                code: 'firmware_mismatch',
                severity: 'warning',
                message: `Firmware ${input.reportedFirmware} != expected ${input.expectedFirmware}`,
            });
        }
        return alerts;
    }
    isHealthy(alerts) {
        return !alerts.some((a) => a.severity === 'critical');
    }
}
exports.StationHeartbeatEngine = StationHeartbeatEngine;
//# sourceMappingURL=station-heartbeat.engine.js.map