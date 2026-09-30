"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGateEngine = exports.SafetyGateEngine = void 0;
class SafetyGateEngine {
    evaluate(incidentId, context) {
        const checks = [];
        if (context.activeEmergency === true) {
            checks.push({
                passed: false,
                reason: 'Active emergency declared on project — incident workflow blocked',
                gate: 'emergency_active',
            });
        }
        else if (context.activeEmergency === false) {
            checks.push({
                passed: true,
                reason: 'No active emergency on project',
                gate: 'emergency_active',
            });
        }
        if (context.workerSafetyOk === false) {
            checks.push({
                passed: false,
                reason: 'Involved worker safety score below threshold',
                gate: 'worker_safety',
            });
        }
        else if (context.workerSafetyOk === true) {
            checks.push({
                passed: true,
                reason: 'Worker safety profile acceptable',
                gate: 'worker_safety',
            });
        }
        const highSeverity = ['high', 'critical'].includes(context.severity);
        if (highSeverity && context.witnessCount === 0) {
            checks.push({
                passed: false,
                reason: 'High/critical incidents require at least one witness',
                gate: 'witness_required',
            });
        }
        else if (highSeverity) {
            checks.push({
                passed: true,
                reason: 'Witness requirement met',
                gate: 'witness_required',
            });
        }
        if (context.sifPotential && context.closing) {
            if (!context.investigationComplete) {
                checks.push({
                    passed: false,
                    reason: 'SIF-potential incidents require completed investigation before close',
                    gate: 'investigation_required',
                });
            }
            else {
                checks.push({
                    passed: true,
                    reason: 'Investigation completed for SIF-potential incident',
                    gate: 'investigation_required',
                });
            }
            const capaCount = context.correctiveActionsLinked ?? 0;
            checks.push({
                passed: capaCount > 0,
                reason: capaCount > 0
                    ? 'Corrective action linked'
                    : 'SIF-potential incidents require at least one linked corrective action',
                gate: 'capa_required',
            });
        }
        if (context.closing && ['high', 'critical', 'medium'].includes(context.severity)) {
            checks.push({
                passed: !!context.investigationComplete,
                reason: context.investigationComplete
                    ? 'Investigation complete for medium+ severity closeout'
                    : 'Medium+ severity incidents require investigation before close',
                gate: 'close_investigation',
            });
        }
        const failed = checks.filter((c) => !c.passed);
        return {
            passed: failed.length === 0,
            reason: failed.length === 0
                ? `All incident safety gates passed (${incidentId})`
                : failed.map((f) => f.reason).join('; '),
            gates: failed.map((f) => f.gate),
            checks,
        };
    }
}
exports.SafetyGateEngine = SafetyGateEngine;
exports.safetyGateEngine = new SafetyGateEngine();
