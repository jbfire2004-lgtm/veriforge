"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeService = void 0;
const realtime_inference_engine_1 = require("../engines/realtime-inference.engine");
const inference_log_repository_1 = require("../models/inference-log.repository");
const logger_1 = require("../utils/logger");
function num(v) {
    if (v === undefined || v === null)
        return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}
function bool(v) {
    if (v === undefined || v === null)
        return undefined;
    return Boolean(v);
}
function strArray(v) {
    if (!Array.isArray(v))
        return undefined;
    return v.map(String);
}
exports.realtimeService = {
    parseSignals(body) {
        const s = (body.signals ?? body.context ?? body);
        return {
            profileScore: num(s.profile_score ?? s.profileScore),
            overdueCapa: num(s.overdue_capa ?? s.overdueCapa),
            workerCriticalCapa: num(s.worker_critical_capa ?? s.workerCriticalCapa),
            denials30d: num(s.denials30d ?? s.denials_30d),
            sifExposures: num(s.sif_exposures ?? s.sifExposures),
            openCapa: num(s.open_capa ?? s.openCapa),
            openIncidents: num(s.open_incidents ?? s.openIncidents),
            safetyStatus: s.safety_status !== undefined ? String(s.safety_status) : s.safetyStatus !== undefined ? String(s.safetyStatus) : undefined,
            lockoutStatus: s.lockout_status !== undefined ? String(s.lockout_status) : s.lockoutStatus !== undefined ? String(s.lockoutStatus) : undefined,
            failures90d: num(s.failures90d ?? s.failures_90d),
            inspectionFailures: num(s.inspection_failures ?? s.inspectionFailures),
            projectCriticalCapa: num(s.project_critical_capa ?? s.projectCriticalCapa),
            emergencyActive: bool(s.emergency_active ?? s.emergencyActive),
            sifHazardOpen: num(s.sif_hazard_open ?? s.sifHazardOpen),
            projectScore: num(s.project_score ?? s.projectScore),
            criticalHazards: num(s.critical_hazards ?? s.criticalHazards),
            expiredTraining: num(s.expired_training ?? s.expiredTraining),
            accessDenials30d: num(s.access_denials30d ?? s.accessDenials30d),
        };
    },
    parseTaskRequirements(body) {
        const r = body.task_requirements ?? body.taskRequirements;
        if (!r || typeof r !== 'object')
            return undefined;
        const o = r;
        return {
            requiredSkills: strArray(o.required_skills ?? o.requiredSkills),
            requiredEquipment: strArray(o.required_equipment ?? o.requiredEquipment),
            requiredTraining: strArray(o.required_training ?? o.requiredTraining),
            requiredControls: strArray(o.required_controls ?? o.requiredControls),
            requiredPpe: strArray(o.required_ppe ?? o.requiredPpe),
            requiredJha: strArray(o.required_jha ?? o.requiredJha),
        };
    },
    parseTaskGateContext(body) {
        const c = body.task_gate_context ?? body.taskGateContext ?? body.safety_context ?? body.safetyContext;
        if (!c || typeof c !== 'object')
            return undefined;
        const o = c;
        return {
            assignedWorkers: strArray(o.assigned_workers ?? o.assignedWorkers),
            assignedEquipment: strArray(o.assigned_equipment ?? o.assignedEquipment),
            workerSkills: strArray(o.worker_skills ?? o.workerSkills),
            completedTraining: strArray(o.completed_training ?? o.completedTraining),
            appliedControls: strArray(o.applied_controls ?? o.appliedControls),
            confirmedPpe: strArray(o.confirmed_ppe ?? o.confirmedPpe),
            activeJhaTypes: strArray(o.active_jha_types ?? o.activeJhaTypes),
        };
    },
    parseOverrides(body) {
        const o = body.active_overrides ?? body.activeOverrides;
        if (!Array.isArray(o))
            return undefined;
        return o.map((item) => {
            const x = item;
            return { ruleType: String(x.rule_type ?? x.ruleType), ruleKey: String(x.rule_key ?? x.ruleKey) };
        });
    },
    async logInference(companyId, modelId, version, engineLayer, inputData, outputData, latencyMs) {
        try {
            await inference_log_repository_1.inferenceLogRepository.create({
                companyId,
                modelId,
                version,
                engineLayer,
                inputData,
                outputData,
                latencyMs,
            });
        }
        catch (err) {
            logger_1.logger.warn('inference log persist failed', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    },
    async predict(req) {
        const start = Date.now();
        const result = realtime_inference_engine_1.realtimeInferenceEngine.predict(req);
        const latencyMs = Date.now() - start;
        await this.logInference(req.companyId, result.model.modelId, result.model.version, 'realtime_predict', { ...req, predictionType: req.predictionType }, result, latencyMs);
        return { ...result, latencyMs, modelKey: result.model.modelId };
    },
    async score(req) {
        const start = Date.now();
        const result = realtime_inference_engine_1.realtimeInferenceEngine.score(req);
        const latencyMs = Date.now() - start;
        await this.logInference(req.companyId, result.model.modelId, result.model.version, 'realtime_score', req, result, latencyMs);
        return { ...result, latencyMs, modelKey: result.model.modelId };
    },
    async gate(req) {
        const start = Date.now();
        const result = realtime_inference_engine_1.realtimeInferenceEngine.gate(req);
        const latencyMs = Date.now() - start;
        await this.logInference(req.companyId, result.model.modelId, result.model.version, 'realtime_gate', req, result, latencyMs);
        return { ...result, latencyMs, modelKey: result.model.modelId };
    },
};
