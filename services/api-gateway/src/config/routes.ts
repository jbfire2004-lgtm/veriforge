import fs from 'fs';
import { env } from './env';
import type { ResolvedRoute, RouteDefinitionJson } from '../types';

const targetEnvMap: Record<string, string> = {
  AUTH_SERVICE_URL: env.authServiceUrl,
  RBAC_SERVICE_URL: env.rbacServiceUrl,
  AUDIT_SERVICE_URL: env.auditServiceUrl,
  ATTACHMENT_SERVICE_URL: env.attachmentServiceUrl,
  OFFLINE_SERVICE_URL: env.offlineServiceUrl,
  HAZARD_CONTROL_SERVICE_URL: env.hazardControlServiceUrl,
  JHA_SERVICE_URL: env.jhaServiceUrl,
  CORRECTIVE_ACTION_SERVICE_URL: env.correctiveActionServiceUrl,
  COMPANY_SAFETY_SERVICE_URL: env.companySafetyServiceUrl,
  PROJECT_SAFETY_SERVICE_URL: env.projectSafetyServiceUrl,
  WORKER_SAFETY_SERVICE_URL: env.workerSafetyServiceUrl,
  TRAINING_SERVICE_URL: env.trainingServiceUrl,
  EQUIPMENT_SAFETY_SERVICE_URL: env.equipmentSafetyServiceUrl,
  ACCESS_CONTROL_SERVICE_URL: env.accessControlServiceUrl,
  SAFETY_STATIONS_SERVICE_URL: env.safetyStationsServiceUrl,
  SDS_SERVICE_URL: env.sdsServiceUrl,
  EMERGENCY_SERVICE_URL: env.emergencyServiceUrl,
  PM_PROJECT_SERVICE_URL: env.pmProjectServiceUrl,
  PM_WORK_PACKAGE_SERVICE_URL: env.pmWorkPackageServiceUrl,
  PM_TASK_SERVICE_URL: env.pmTaskServiceUrl,
  PM_SCHEDULE_SERVICE_URL: env.pmScheduleServiceUrl,
  CAIL_INGESTION_SERVICE_URL: env.cailIngestionServiceUrl,
  CAIL_SCORING_SERVICE_URL: env.cailScoringServiceUrl,
  CAIL_PREDICTION_SERVICE_URL: env.cailPredictionServiceUrl,
  CAIL_RECOMMENDATION_SERVICE_URL: env.cailRecommendationServiceUrl,
  CAIL_EXPLAINABILITY_SERVICE_URL: env.cailExplainabilityServiceUrl,
  CAIL_REALTIME_SERVICE_URL: env.cailRealtimeServiceUrl,
  INSPECTION_SERVICE_URL: env.inspectionServiceUrl,
  INCIDENT_SERVICE_URL: env.incidentServiceUrl,
  PERMIT_SERVICE_URL: env.permitServiceUrl,
  CAIL_MODEL_TRAINING_SERVICE_URL: env.cailModelTrainingServiceUrl,
  CAIL_MODEL_VERSIONING_SERVICE_URL: env.cailModelVersioningServiceUrl,
  CAIL_MODEL_DRIFT_SERVICE_URL: env.cailModelDriftServiceUrl,
  CONFIG_SERVICE_URL: env.configServiceUrl,
  BACKEND_SERVICE_URL: env.backendServiceUrl,
};

function resolveTarget(def: RouteDefinitionJson): string {
  if (def.target) return def.target;
  const fromEnv = def.targetEnv ? targetEnvMap[def.targetEnv] : undefined;
  if (!fromEnv) {
    throw new Error(`Route "${def.id}": unknown targetEnv "${def.targetEnv}"`);
  }
  return fromEnv.replace(/\/$/, '');
}

export function loadRoutes(): ResolvedRoute[] {
  const raw = fs.readFileSync(env.routesConfigPath, 'utf8');
  const definitions = JSON.parse(raw) as RouteDefinitionJson[];

  const routes: ResolvedRoute[] = definitions.map((def) => ({
    id: def.id,
    prefix: def.prefix,
    target: resolveTarget(def),
    pathRewrite: def.pathRewrite,
    auth: def.auth,
    publicPaths: (def.publicPaths ?? []).map((p) => new RegExp(p)),
    companyScope: def.companyScope ?? true,
    rbac: def.rbac === false ? undefined : def.rbac,
  }));

  // Longest prefix first so /safety/jha wins over /safety if both existed
  routes.sort((a, b) => b.prefix.length - a.prefix.length);
  return routes;
}
