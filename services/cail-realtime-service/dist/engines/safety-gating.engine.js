"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGatingEngine = exports.SafetyGatingEngine = void 0;
class SafetyGatingEngine {
    evaluateRealtime(signals, scores, overrides) {
        const blockers = [];
        const waived = [];
        const autoCapaSuggestions = [];
        const blocks = {
            workerAccess: false,
            equipmentAccess: false,
            zoneAccess: false,
            taskStart: false,
            permitApproval: false,
            jhaApproval: false,
            pmScheduling: false,
        };
        if (signals.emergencyActive) {
            return {
                allowed: true,
                blockers: ['Emergency active — standard CAPA blocks suspended'],
                requiresSupervisorOverride: false,
                requiresSafetyOverride: false,
                waived: ['emergency_suspend'],
                blocks,
                autoCapaSuggestions: ['Post-emergency CAPA review'],
            };
        }
        const workerOverdue = signals.overdueCapa ?? 0;
        const workerCritical = signals.workerCriticalCapa ?? 0;
        const workerScore = scores.workerScore ?? signals.profileScore ?? 100;
        const equipmentScore = scores.equipmentScore ?? 100;
        if (workerOverdue > 0 && !this.waived(overrides, 'worker', 'OVERDUE')) {
            blockers.push(`${workerOverdue} overdue worker CAPA`);
            blocks.workerAccess = true;
            blocks.zoneAccess = true;
            blocks.taskStart = true;
            autoCapaSuggestions.push('Resolve overdue worker CAPA before access');
        }
        if (workerCritical > 0 && !this.waived(overrides, 'worker', 'CRITICAL')) {
            blockers.push(`${workerCritical} critical worker CAPA`);
            blocks.workerAccess = true;
            blocks.jhaApproval = true;
            blocks.permitApproval = true;
        }
        if (workerScore < 40) {
            blockers.push(`Worker safety score ${workerScore} below threshold`);
            blocks.workerAccess = true;
            blocks.zoneAccess = true;
        }
        if ((signals.openCapa ?? 0) > 0 && scores.equipmentScore !== undefined) {
            blockers.push(`${signals.openCapa} open equipment CAPA`);
            blocks.equipmentAccess = true;
        }
        if (equipmentScore < 50) {
            blockers.push(`Equipment safety score ${equipmentScore} unsafe`);
            blocks.equipmentAccess = true;
        }
        if ((signals.projectCriticalCapa ?? 0) > 0) {
            blockers.push(`${signals.projectCriticalCapa} critical project CAPA`);
            blocks.taskStart = true;
            blocks.pmScheduling = true;
            blocks.permitApproval = true;
        }
        if ((signals.sifHazardOpen ?? 0) > 0) {
            blockers.push(`${signals.sifHazardOpen} open SIF-potential hazard(s)`);
            blocks.jhaApproval = true;
            autoCapaSuggestions.push('Supervisor review for SIF hazards');
        }
        return {
            allowed: blockers.length === 0,
            blockers,
            requiresSupervisorOverride: blocks.jhaApproval || blocks.taskStart,
            requiresSafetyOverride: workerCritical > 0 || (signals.sifHazardOpen ?? 0) > 0,
            waived,
            blocks,
            autoCapaSuggestions,
        };
    }
    evaluateTaskRequirements(taskId, requirements, context) {
        const checks = [];
        const workers = new Set(context.assignedWorkers ?? []);
        const equipment = new Set(context.assignedEquipment ?? []);
        const skills = new Set(context.workerSkills ?? []);
        const training = new Set(context.completedTraining ?? []);
        const controls = new Set(context.appliedControls ?? []);
        const ppe = new Set(context.confirmedPpe ?? []);
        const jha = new Set(context.activeJhaTypes ?? []);
        for (const skill of requirements.requiredSkills ?? []) {
            checks.push({
                passed: skills.has(skill),
                gate: 'required_skills',
                reason: skills.has(skill) ? `Skill ${skill} present` : `Missing skill ${skill}`,
            });
        }
        for (const id of requirements.requiredEquipment ?? []) {
            checks.push({
                passed: equipment.has(id),
                gate: 'required_equipment',
                reason: equipment.has(id) ? `Equipment ${id} assigned` : `Equipment ${id} not assigned`,
            });
        }
        for (const course of requirements.requiredTraining ?? []) {
            checks.push({
                passed: training.has(course),
                gate: 'required_training',
                reason: training.has(course) ? `Training ${course} complete` : `Missing training ${course}`,
            });
        }
        for (const c of requirements.requiredControls ?? []) {
            checks.push({
                passed: controls.has(c),
                gate: 'required_controls',
                reason: controls.has(c) ? `Control ${c} applied` : `Missing control ${c}`,
            });
        }
        for (const item of requirements.requiredPpe ?? []) {
            checks.push({
                passed: ppe.has(item),
                gate: 'required_ppe',
                reason: ppe.has(item) ? `PPE ${item} confirmed` : `PPE ${item} not confirmed`,
            });
        }
        for (const j of requirements.requiredJha ?? []) {
            checks.push({
                passed: jha.has(j),
                gate: 'required_jha',
                reason: jha.has(j) ? `JHA ${j} active` : `Missing JHA ${j}`,
            });
        }
        const failed = checks.filter((c) => !c.passed);
        return {
            passed: failed.length === 0,
            reason: failed.length === 0 ? 'All task safety gates passed' : failed.map((f) => f.reason).join('; '),
            gates: failed.map((f) => f.gate),
        };
    }
    waived(overrides, type, key) {
        return (overrides ?? []).some((o) => o.ruleType === type && o.ruleKey === key);
    }
}
exports.SafetyGatingEngine = SafetyGatingEngine;
exports.safetyGatingEngine = new SafetyGatingEngine();
