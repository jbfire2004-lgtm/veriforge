import { env } from '../config/env';
import { realtimeInferenceEngine } from '../engines/realtime-inference.engine';
import { inferenceLogRepository } from '../models/inference-log.repository';
import type {
  GateOverride,
  RealtimeGateRequest,
  RealtimePredictRequest,
  RealtimeScoreRequest,
  RealtimeSignals,
  TaskGateContext,
  TaskGateRequirements,
} from '../types';
import { logger } from '../utils/logger';

function num(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function bool(v: unknown): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  return Boolean(v);
}

function strArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map(String);
}

export const realtimeService = {
  parseSignals(body: Record<string, unknown>): RealtimeSignals {
    const s = (body.signals ?? body.context ?? body) as Record<string, unknown>;
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

  parseTaskRequirements(body: Record<string, unknown>): TaskGateRequirements | undefined {
    const r = body.task_requirements ?? body.taskRequirements;
    if (!r || typeof r !== 'object') return undefined;
    const o = r as Record<string, unknown>;
    return {
      requiredSkills: strArray(o.required_skills ?? o.requiredSkills),
      requiredEquipment: strArray(o.required_equipment ?? o.requiredEquipment),
      requiredTraining: strArray(o.required_training ?? o.requiredTraining),
      requiredControls: strArray(o.required_controls ?? o.requiredControls),
      requiredPpe: strArray(o.required_ppe ?? o.requiredPpe),
      requiredJha: strArray(o.required_jha ?? o.requiredJha),
    };
  },

  parseTaskGateContext(body: Record<string, unknown>): TaskGateContext | undefined {
    const c = body.task_gate_context ?? body.taskGateContext ?? body.safety_context ?? body.safetyContext;
    if (!c || typeof c !== 'object') return undefined;
    const o = c as Record<string, unknown>;
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

  parseOverrides(body: Record<string, unknown>): GateOverride[] | undefined {
    const o = body.active_overrides ?? body.activeOverrides;
    if (!Array.isArray(o)) return undefined;
    return o.map((item) => {
      const x = item as Record<string, unknown>;
      return { ruleType: String(x.rule_type ?? x.ruleType), ruleKey: String(x.rule_key ?? x.ruleKey) };
    });
  },

  async logInference(
    companyId: string,
    modelId: string,
    version: number,
    engineLayer: string,
    inputData: unknown,
    outputData: unknown,
    latencyMs: number,
  ) {
    try {
      await inferenceLogRepository.create({
        companyId,
        modelId,
        version,
        engineLayer,
        inputData,
        outputData,
        latencyMs,
      });
    } catch (err) {
      logger.warn('inference log persist failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  async predict(req: RealtimePredictRequest) {
    const start = Date.now();
    const result = realtimeInferenceEngine.predict(req);
    const latencyMs = Date.now() - start;

    await this.logInference(
      req.companyId,
      result.model.modelId,
      result.model.version,
      'realtime_predict',
      { ...req, predictionType: req.predictionType },
      result,
      latencyMs,
    );

    return { ...result, latencyMs, modelKey: result.model.modelId };
  },

  async score(req: RealtimeScoreRequest) {
    const start = Date.now();
    const result = realtimeInferenceEngine.score(req);
    const latencyMs = Date.now() - start;

    await this.logInference(
      req.companyId,
      result.model.modelId,
      result.model.version,
      'realtime_score',
      req,
      result,
      latencyMs,
    );

    return { ...result, latencyMs, modelKey: result.model.modelId };
  },

  async gate(req: RealtimeGateRequest) {
    const start = Date.now();
    const result = realtimeInferenceEngine.gate(req);
    const latencyMs = Date.now() - start;

    await this.logInference(
      req.companyId,
      result.model.modelId,
      result.model.version,
      'realtime_gate',
      req,
      result,
      latencyMs,
    );

    return { ...result, latencyMs, modelKey: result.model.modelId };
  },
};
