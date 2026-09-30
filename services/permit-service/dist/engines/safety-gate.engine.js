"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGateEngine = exports.SafetyGateEngine = void 0;
const jha_client_1 = require("../clients/jha.client");
const training_client_1 = require("../clients/training.client");
const sds_client_1 = require("../clients/sds.client");
const hazard_control_client_1 = require("../clients/hazard-control.client");
const pm_task_client_1 = require("../clients/pm-task.client");
class SafetyGateEngine {
    async evaluate(input) {
        const checks = [];
        if (input.jhaId) {
            const score = await jha_client_1.jhaClient.getScore({
                jhaId: input.jhaId,
                companyId: input.companyId,
                token: input.token,
            });
            if (!score) {
                checks.push({
                    requirementType: 'jha',
                    satisfied: false,
                    reason: 'JHA service unavailable — cannot verify JHA',
                    linkedId: input.jhaId,
                });
            }
            else {
                const satisfied = score.approved && !score.blockSubmission;
                checks.push({
                    requirementType: 'jha',
                    satisfied,
                    reason: satisfied
                        ? 'JHA approved and submission not blocked'
                        : score.blockReasons.length
                            ? score.blockReasons.join('; ')
                            : 'JHA not approved or blocked',
                    linkedId: input.jhaId,
                    metadata: { riskScore: score.riskScore, status: score.status },
                });
            }
        }
        else {
            checks.push({
                requirementType: 'jha',
                satisfied: false,
                reason: 'JHA link required before approval',
            });
        }
        const workerId = input.workerId;
        if (workerId) {
            const training = await training_client_1.trainingClient.getWorkerTraining({
                workerId,
                companyId: input.companyId,
                token: input.token,
                role: input.workerRole,
            });
            if (!training) {
                checks.push({
                    requirementType: 'training',
                    satisfied: false,
                    reason: 'Training service unavailable — cannot verify training',
                    linkedId: workerId,
                });
            }
            else {
                const satisfied = training.compliant && training.missingRequired.length === 0;
                checks.push({
                    requirementType: 'training',
                    satisfied,
                    reason: satisfied
                        ? 'Worker training current'
                        : training.missingRequired.length
                            ? `Missing required training: ${training.missingRequired.join(', ')}`
                            : `${training.expiredCount} expired training record(s)`,
                    linkedId: workerId,
                    metadata: {
                        expiredCount: training.expiredCount,
                        missingRequired: training.missingRequired,
                    },
                });
            }
            const sds = await sds_client_1.sdsClient.getWorkerSds({
                workerId,
                companyId: input.companyId,
                token: input.token,
            });
            if (!sds) {
                checks.push({
                    requirementType: 'sds',
                    satisfied: false,
                    reason: 'SDS service unavailable — cannot verify SDS acknowledgements',
                    linkedId: workerId,
                });
            }
            else {
                checks.push({
                    requirementType: 'sds',
                    satisfied: sds.acknowledged,
                    reason: sds.acknowledged
                        ? 'All required SDS documents acknowledged'
                        : `${sds.pendingCount} SDS acknowledgement(s) pending`,
                    linkedId: workerId,
                    metadata: { pendingCount: sds.pendingCount },
                });
            }
        }
        else {
            checks.push({
                requirementType: 'training',
                satisfied: false,
                reason: 'Worker required for training verification',
            });
            checks.push({
                requirementType: 'sds',
                satisfied: false,
                reason: 'Worker required for SDS verification',
            });
        }
        if (input.equipmentId) {
            checks.push({
                requirementType: 'equipment_cert',
                satisfied: true,
                reason: 'Equipment certification recorded on permit',
                linkedId: input.equipmentId,
                metadata: { verifiedLocally: true },
            });
        }
        else {
            checks.push({
                requirementType: 'equipment_cert',
                satisfied: false,
                reason: 'Equipment certification link required',
            });
        }
        if (input.hazardId && input.controlId) {
            const [hazard, control] = await Promise.all([
                hazard_control_client_1.hazardControlClient.getHazard({
                    hazardId: input.hazardId,
                    companyId: input.companyId,
                    token: input.token,
                }),
                hazard_control_client_1.hazardControlClient.getControl({
                    controlId: input.controlId,
                    companyId: input.companyId,
                    token: input.token,
                }),
            ]);
            if (!hazard || !control) {
                checks.push({
                    requirementType: 'hazard_control',
                    satisfied: false,
                    reason: 'Hazard control service unavailable — cannot verify controls',
                    linkedId: input.controlId,
                });
            }
            else {
                const satisfied = hazard.active && control.effective;
                checks.push({
                    requirementType: 'hazard_control',
                    satisfied,
                    reason: satisfied
                        ? 'Hazard active with effective control in place'
                        : !hazard.active
                            ? 'Hazard is mitigated or closed'
                            : 'Control not effective or not active',
                    linkedId: input.controlId,
                    metadata: { hazardId: input.hazardId },
                });
            }
        }
        else {
            checks.push({
                requirementType: 'hazard_control',
                satisfied: false,
                reason: 'Hazard and control links required before approval',
            });
        }
        if (input.pmTaskId) {
            const task = await pm_task_client_1.pmTaskClient.getTask({
                taskId: input.pmTaskId,
                companyId: input.companyId,
                token: input.token,
            });
            if (task && task.exists === false) {
                const hazardIdx = checks.findIndex((c) => c.requirementType === 'hazard_control');
                if (hazardIdx >= 0) {
                    checks[hazardIdx] = {
                        ...checks[hazardIdx],
                        satisfied: false,
                        reason: 'Linked PM task not found',
                    };
                }
            }
        }
        const blockReasons = checks.filter((c) => !c.satisfied).map((c) => c.reason);
        const passed = input.requireAll === false
            ? checks.some((c) => c.satisfied)
            : blockReasons.length === 0;
        return { passed, checks, blockReasons };
    }
}
exports.SafetyGateEngine = SafetyGateEngine;
exports.safetyGateEngine = new SafetyGateEngine();
