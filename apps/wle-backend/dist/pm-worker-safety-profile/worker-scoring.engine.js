"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerScoringEngine = void 0;
class WorkerScoringEngine {
    compute(input) {
        const factors = {};
        let penalty = 0;
        factors.expiredTraining = Math.min(25, input.expiredTraining * 8);
        penalty += factors.expiredTraining;
        factors.missingTraining = Math.min(20, input.missingTraining * 10);
        penalty += factors.missingTraining;
        factors.openCapa = Math.min(20, input.openCapa * 5);
        penalty += factors.openCapa;
        factors.overdueCapa = Math.min(25, input.overdueCapa * 12);
        penalty += factors.overdueCapa;
        factors.sifCapa = input.sifCapa > 0 ? 20 : 0;
        penalty += factors.sifCapa;
        factors.incidents = input.incidentCount12m > 0 ? 15 : 0;
        penalty += factors.incidents;
        factors.hazardExposure = Math.min(15, input.hazardExposureHigh * 3);
        penalty += factors.hazardExposure;
        const denialRate = input.accessAttempts30d > 0
            ? input.accessDenials30d / input.accessAttempts30d
            : 0;
        factors.accessDenials = Math.min(20, Math.round(denialRate * 40));
        penalty += factors.accessDenials;
        factors.expiredAuths = Math.min(15, input.expiredAuths * 10);
        penalty += factors.expiredAuths;
        factors.medical = input.activeMedicalBlocks > 0 ? 10 : 0;
        penalty += factors.medical;
        factors.sds = input.missingSdsAck > 0 ? 8 : 0;
        penalty += factors.sds;
        factors.policy = input.missingPolicyAck > 0 ? 8 : 0;
        penalty += factors.policy;
        factors.staleFlha = input.staleFlha ? 12 : 0;
        penalty += factors.staleFlha;
        factors.meetings = input.poorMeetingAttendance ? 5 : 0;
        penalty += factors.meetings;
        const score = Math.max(0, Math.min(100, 100 - penalty));
        const riskLevel = score < 40 || input.sifCapa > 0
            ? 'critical'
            : score < 55
                ? 'high'
                : score < 75
                    ? 'medium'
                    : 'low';
        const requiredActions = [];
        if (input.missingTraining > 0)
            requiredActions.push('Complete required training');
        if (input.overdueCapa > 0)
            requiredActions.push('Close overdue corrective actions');
        if (input.expiredAuths > 0)
            requiredActions.push('Renew equipment authorizations');
        if (input.staleFlha)
            requiredActions.push('Submit current FLHA');
        if (input.missingPolicyAck > 0)
            requiredActions.push('Acknowledge required policies');
        const requiresSupervisorReview = riskLevel === 'critical' ||
            riskLevel === 'high' ||
            input.overdueCapa > 0 ||
            denialRate > 0.3;
        return {
            score,
            riskLevel,
            factors,
            requiredActions,
            requiresSupervisorReview,
        };
    }
}
exports.WorkerScoringEngine = WorkerScoringEngine;
//# sourceMappingURL=worker-scoring.engine.js.map