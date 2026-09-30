"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGateEngine = exports.SafetyGateEngine = void 0;
exports.toStringArray = toStringArray;
exports.extractRequirements = extractRequirements;
function toStringArray(value) {
    if (!Array.isArray(value))
        return [];
    return value.map(String);
}
function extractRequirements(task) {
    return {
        requiredSkills: toStringArray(task.requiredSkills),
        requiredEquipment: toStringArray(task.requiredEquipment),
        requiredTraining: toStringArray(task.requiredTraining),
        requiredControls: toStringArray(task.requiredControls),
        requiredPpe: toStringArray(task.requiredPpe),
        requiredJha: toStringArray(task.requiredJha),
    };
}
class SafetyGateEngine {
    evaluate(taskId, requirements, context) {
        const checks = [];
        const workers = new Set(context.assignedWorkers ?? []);
        const equipment = new Set(context.assignedEquipment ?? []);
        const skills = new Set(context.workerSkills ?? []);
        const training = new Set(context.completedTraining ?? []);
        const controls = new Set(context.appliedControls ?? []);
        const ppe = new Set(context.confirmedPpe ?? []);
        const jha = new Set(context.activeJhaTypes ?? []);
        for (const id of requirements.requiredEquipment ?? []) {
            checks.push({
                passed: equipment.has(id),
                reason: equipment.has(id) ? `Equipment ${id} assigned` : `Equipment ${id} not assigned`,
                gate: 'required_equipment',
            });
        }
        for (const skill of requirements.requiredSkills ?? []) {
            checks.push({
                passed: skills.has(skill),
                reason: skills.has(skill) ? `Skill ${skill} present` : `Missing skill ${skill}`,
                gate: 'required_skills',
            });
        }
        for (const course of requirements.requiredTraining ?? []) {
            checks.push({
                passed: training.has(course),
                reason: training.has(course) ? `Training ${course} complete` : `Missing training ${course}`,
                gate: 'required_training',
            });
        }
        for (const control of requirements.requiredControls ?? []) {
            checks.push({
                passed: controls.has(control),
                reason: controls.has(control) ? `Control ${control} applied` : `Missing control ${control}`,
                gate: 'required_controls',
            });
        }
        for (const item of requirements.requiredPpe ?? []) {
            checks.push({
                passed: ppe.has(item),
                reason: ppe.has(item) ? `PPE ${item} confirmed` : `PPE ${item} not confirmed`,
                gate: 'required_ppe',
            });
        }
        for (const jhaType of requirements.requiredJha ?? []) {
            checks.push({
                passed: jha.has(jhaType),
                reason: jha.has(jhaType) ? `JHA ${jhaType} active` : `Missing JHA ${jhaType}`,
                gate: 'required_jha',
            });
        }
        if ((requirements.requiredEquipment?.length ?? 0) > 0 && workers.size === 0) {
            checks.push({
                passed: false,
                reason: 'At least one worker must be assigned',
                gate: 'worker_assignment',
            });
        }
        const failed = checks.filter((c) => !c.passed);
        return {
            passed: failed.length === 0,
            reason: failed.length === 0 ? 'All scheduling safety gates passed' : failed.map((f) => f.reason).join('; '),
            gates: failed.map((f) => f.gate),
            taskId,
        };
    }
}
exports.SafetyGateEngine = SafetyGateEngine;
exports.safetyGateEngine = new SafetyGateEngine();
