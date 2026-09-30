"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGatingEngine = exports.equipmentValidationEngine = exports.workerValidationEngine = exports.heartbeatEngine = exports.SafetyGatingEngine = exports.EquipmentValidationEngine = exports.WorkerValidationEngine = exports.HeartbeatEngine = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
class HeartbeatEngine {
    isStale(lastHeartbeat, now = new Date()) {
        if (!lastHeartbeat)
            return true;
        const ageSec = (now.getTime() - lastHeartbeat.getTime()) / 1000;
        return ageSec > env_1.env.heartbeatStaleSeconds;
    }
    resolveStatus(lastHeartbeat, current, emergencyMode) {
        if (emergencyMode)
            return client_1.StationStatus.emergency;
        if (this.isStale(lastHeartbeat))
            return client_1.StationStatus.offline;
        if (current === client_1.StationStatus.maintenance)
            return client_1.StationStatus.maintenance;
        return client_1.StationStatus.online;
    }
}
exports.HeartbeatEngine = HeartbeatEngine;
class WorkerValidationEngine {
    evaluate(worker, requiredJhaIds = [], emergencyMode) {
        const checks = [];
        if (emergencyMode === 'lockdown') {
            checks.push({
                passed: false,
                reason: 'Site lockdown active',
                gate: 'emergency_lockdown',
            });
        }
        if ((worker.activeRestrictions ?? []).length > 0) {
            checks.push({
                passed: false,
                reason: `Active restrictions: ${worker.activeRestrictions.join(', ')}`,
                gate: 'worker_restriction',
            });
        }
        if (worker.riskLevel?.toLowerCase() === 'critical') {
            checks.push({
                passed: false,
                reason: 'Worker risk level is critical',
                gate: 'worker_risk',
            });
        }
        for (const jhaId of requiredJhaIds) {
            const signed = (worker.signedJhaIds ?? []).includes(jhaId);
            checks.push({
                passed: signed,
                reason: signed ? `JHA ${jhaId} signed` : `Missing signed JHA ${jhaId}`,
                gate: 'jha_validation',
            });
        }
        return checks;
    }
}
exports.WorkerValidationEngine = WorkerValidationEngine;
class EquipmentValidationEngine {
    evaluate(equipment, emergencyMode) {
        const checks = [];
        if (emergencyMode === 'evacuation' && equipment.activeLockout !== true) {
            checks.push({
                passed: true,
                reason: 'Evacuation mode — equipment check deferred',
                gate: 'emergency_evacuation',
            });
            return checks;
        }
        if (equipment.activeLockout) {
            checks.push({
                passed: false,
                reason: 'Equipment is locked out',
                gate: 'equipment_lockout',
            });
        }
        if (equipment.status === 'locked_out' || equipment.status === 'out_of_service') {
            checks.push({
                passed: false,
                reason: `Equipment status: ${equipment.status}`,
                gate: 'equipment_status',
            });
        }
        if ((equipment.expiredCertifications ?? 0) > 0) {
            checks.push({
                passed: false,
                reason: `${equipment.expiredCertifications} expired certification(s)`,
                gate: 'equipment_certification',
            });
        }
        if (equipment.conditionScore != null && equipment.conditionScore < 50) {
            checks.push({
                passed: false,
                reason: `Condition score ${equipment.conditionScore} below threshold`,
                gate: 'equipment_condition',
            });
        }
        return checks;
    }
}
exports.EquipmentValidationEngine = EquipmentValidationEngine;
class SafetyGatingEngine {
    aggregate(checks) {
        const failed = checks.filter((c) => !c.passed);
        if (failed.length === 0) {
            return { granted: true, reason: 'All safety gates passed', failedGates: [] };
        }
        return {
            granted: false,
            reason: failed.map((f) => f.reason).join('; '),
            failedGates: failed.map((f) => f.gate),
        };
    }
}
exports.SafetyGatingEngine = SafetyGatingEngine;
exports.heartbeatEngine = new HeartbeatEngine();
exports.workerValidationEngine = new WorkerValidationEngine();
exports.equipmentValidationEngine = new EquipmentValidationEngine();
exports.safetyGatingEngine = new SafetyGatingEngine();
