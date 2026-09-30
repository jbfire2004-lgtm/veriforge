"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationEngine = exports.missingWorkerEngine = exports.NotificationEngine = exports.MissingWorkerEngine = void 0;
exports.mapLockoutMode = mapLockoutMode;
exports.defaultAttendanceStatus = defaultAttendanceStatus;
const client_1 = require("@prisma/client");
class MissingWorkerEngine {
    detect(input) {
        const checkedSet = new Set(input.checkedInWorkerIds);
        const missingWorkers = input.expectedRoster.filter((id) => !checkedSet.has(id));
        const expected = input.expectedRoster.length;
        const attendanceRate = expected === 0 ? 100 : Math.round((input.checkedInWorkerIds.length / expected) * 100);
        return { missingWorkers, attendanceRate };
    }
}
exports.MissingWorkerEngine = MissingWorkerEngine;
class NotificationEngine {
    buildEmergencyMessage(input) {
        const parts = [
            `EMERGENCY: ${input.type.toUpperCase()}`,
            `Severity: ${input.severity}`,
        ];
        if (input.projectId)
            parts.push(`Project: ${input.projectId}`);
        if (input.description)
            parts.push(input.description);
        return parts.join(' | ');
    }
}
exports.NotificationEngine = NotificationEngine;
function mapLockoutMode(emergencyType) {
    switch (emergencyType) {
        case 'fire':
        case 'hazmat':
        case 'security':
            return 'lockdown';
        case 'evacuation':
        case 'weather':
            return 'evacuation';
        default:
            return 'muster';
    }
}
exports.missingWorkerEngine = new MissingWorkerEngine();
exports.notificationEngine = new NotificationEngine();
function defaultAttendanceStatus(status) {
    if (status === 'absent')
        return client_1.MusterAttendanceStatus.absent;
    if (status === 'evacuated')
        return client_1.MusterAttendanceStatus.evacuated;
    if (status === 'unknown')
        return client_1.MusterAttendanceStatus.unknown;
    return client_1.MusterAttendanceStatus.present;
}
