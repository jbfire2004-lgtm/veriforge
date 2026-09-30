"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideEngine = exports.safetyGatingEngine = exports.equipmentAccessEngine = exports.workerAccessEngine = exports.zoneRuleEngine = exports.emergencyLockoutEngine = exports.OverrideEngine = exports.SafetyGatingEngine = exports.EquipmentAccessEngine = exports.WorkerAccessEngine = exports.ZoneRuleEngine = exports.EmergencyLockoutEngine = void 0;
exports.parseRules = parseRules;
class EmergencyLockoutEngine {
    isBlocked(activeLockouts, projectId) {
        const companyWide = activeLockouts.some((l) => !l.projectId);
        const projectWide = projectId
            ? activeLockouts.some((l) => l.projectId === projectId)
            : false;
        if (companyWide || projectWide) {
            return {
                passed: false,
                reason: 'Emergency lockout active',
                gate: 'emergency_lockout',
            };
        }
        return { passed: true, reason: 'No emergency lockout', gate: 'emergency_lockout' };
    }
}
exports.EmergencyLockoutEngine = EmergencyLockoutEngine;
class ZoneRuleEngine {
    evaluate(rules, worker) {
        const checks = [];
        if (rules.blockedRoles?.length && worker.role) {
            const blocked = rules.blockedRoles.map((r) => r.toLowerCase()).includes(worker.role.toLowerCase());
            checks.push({
                passed: !blocked,
                reason: blocked ? `Role ${worker.role} blocked for zone` : 'Role allowed',
                gate: 'zone_role',
            });
        }
        if (rules.minSafetyScore != null) {
            const score = worker.safetyScore ?? 0;
            checks.push({
                passed: score >= rules.minSafetyScore,
                reason: score >= rules.minSafetyScore
                    ? 'Safety score sufficient'
                    : `Safety score ${score} below minimum ${rules.minSafetyScore}`,
                gate: 'safety_score',
            });
        }
        for (const courseId of rules.requiredTraining ?? []) {
            const has = (worker.completedTraining ?? []).includes(courseId);
            checks.push({
                passed: has,
                reason: has ? `Training ${courseId} complete` : `Missing training ${courseId}`,
                gate: 'required_training',
            });
        }
        for (const code of rules.requiredCompetencies ?? []) {
            const has = (worker.competencies ?? []).includes(code);
            checks.push({
                passed: has,
                reason: has ? `Competency ${code} verified` : `Missing competency ${code}`,
                gate: 'required_competency',
            });
        }
        for (const auth of rules.requiredEquipmentAuthorization ?? []) {
            const has = (worker.equipmentAuthorizations ?? []).includes(auth);
            checks.push({
                passed: has,
                reason: has ? `Equipment auth ${auth} present` : `Missing equipment authorization ${auth}`,
                gate: 'equipment_authorization',
            });
        }
        if (rules.requiredPpe?.length) {
            checks.push({
                passed: true,
                reason: 'PPE attestation required at gate (not verified remotely)',
                gate: 'required_ppe',
            });
        }
        return checks;
    }
}
exports.ZoneRuleEngine = ZoneRuleEngine;
class WorkerAccessEngine {
    evaluate(worker) {
        const checks = [];
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
        return checks;
    }
}
exports.WorkerAccessEngine = WorkerAccessEngine;
class EquipmentAccessEngine {
    evaluate(equipment) {
        const checks = [];
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
exports.EquipmentAccessEngine = EquipmentAccessEngine;
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
class OverrideEngine {
    isActive(expiry, now = new Date()) {
        if (!expiry)
            return true;
        return expiry.getTime() > now.getTime();
    }
}
exports.OverrideEngine = OverrideEngine;
exports.emergencyLockoutEngine = new EmergencyLockoutEngine();
exports.zoneRuleEngine = new ZoneRuleEngine();
exports.workerAccessEngine = new WorkerAccessEngine();
exports.equipmentAccessEngine = new EquipmentAccessEngine();
exports.safetyGatingEngine = new SafetyGatingEngine();
exports.overrideEngine = new OverrideEngine();
function parseRules(raw) {
    if (!raw || typeof raw !== 'object')
        return {};
    const r = raw;
    return {
        requiredTraining: Array.isArray(r.requiredTraining) ? r.requiredTraining : undefined,
        requiredPpe: Array.isArray(r.requiredPpe) ? r.requiredPpe : undefined,
        requiredCompetencies: Array.isArray(r.requiredCompetencies)
            ? r.requiredCompetencies
            : undefined,
        requiredEquipmentAuthorization: Array.isArray(r.requiredEquipmentAuthorization)
            ? r.requiredEquipmentAuthorization
            : undefined,
        minSafetyScore: typeof r.minSafetyScore === 'number' ? r.minSafetyScore : undefined,
        blockedRoles: Array.isArray(r.blockedRoles) ? r.blockedRoles : undefined,
    };
}
