import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';
const corsOrigin = process.env.CORS_ORIGIN ?? (isProduction ? '' : '*');

if (isProduction && (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32)) {
  throw new Error('JWT_ACCESS_SECRET must be set with at least 32 characters in production.');
}
if (isProduction && (!corsOrigin || corsOrigin.includes('*'))) {
  throw new Error('CORS_ORIGIN must be explicitly configured without wildcards in production.');
}
if (
  isProduction &&
  (!process.env.AUDIT_SERVICE_KEY || process.env.AUDIT_SERVICE_KEY.length < 24)
) {
  throw new Error('AUDIT_SERVICE_KEY must be set in production.');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 8080),
  authServiceUrl: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
  rbacServiceUrl: process.env.RBAC_SERVICE_URL ?? 'http://localhost:3002',
  auditServiceUrl: process.env.AUDIT_SERVICE_URL ?? 'http://localhost:3003',
  attachmentServiceUrl: process.env.ATTACHMENT_SERVICE_URL ?? 'http://localhost:3004',
  offlineServiceUrl: process.env.OFFLINE_SERVICE_URL ?? 'http://localhost:3005',
  hazardControlServiceUrl:
    process.env.HAZARD_CONTROL_SERVICE_URL ?? 'http://localhost:3006',
  jhaServiceUrl: process.env.JHA_SERVICE_URL ?? 'http://localhost:3007',
  correctiveActionServiceUrl:
    process.env.CORRECTIVE_ACTION_SERVICE_URL ?? 'http://localhost:3008',
  companySafetyServiceUrl:
    process.env.COMPANY_SAFETY_SERVICE_URL ?? 'http://localhost:3009',
  projectSafetyServiceUrl:
    process.env.PROJECT_SAFETY_SERVICE_URL ?? 'http://localhost:3010',
  workerSafetyServiceUrl:
    process.env.WORKER_SAFETY_SERVICE_URL ?? 'http://localhost:3011',
  trainingServiceUrl: process.env.TRAINING_SERVICE_URL ?? 'http://localhost:3012',
  equipmentSafetyServiceUrl:
    process.env.EQUIPMENT_SAFETY_SERVICE_URL ?? 'http://localhost:3013',
  accessControlServiceUrl:
    process.env.ACCESS_CONTROL_SERVICE_URL ?? 'http://localhost:3014',
  safetyStationsServiceUrl:
    process.env.SAFETY_STATIONS_SERVICE_URL ?? 'http://localhost:3015',
  sdsServiceUrl: process.env.SDS_SERVICE_URL ?? 'http://localhost:3016',
  emergencyServiceUrl: process.env.EMERGENCY_SERVICE_URL ?? 'http://localhost:3017',
  pmProjectServiceUrl: process.env.PM_PROJECT_SERVICE_URL ?? 'http://localhost:3018',
  pmWorkPackageServiceUrl:
    process.env.PM_WORK_PACKAGE_SERVICE_URL ?? 'http://localhost:3019',
  pmTaskServiceUrl: process.env.PM_TASK_SERVICE_URL ?? 'http://localhost:3020',
  pmScheduleServiceUrl: process.env.PM_SCHEDULE_SERVICE_URL ?? 'http://localhost:3021',
  cailIngestionServiceUrl:
    process.env.CAIL_INGESTION_SERVICE_URL ?? 'http://localhost:3022',
  cailScoringServiceUrl: process.env.CAIL_SCORING_SERVICE_URL ?? 'http://localhost:3023',
  cailPredictionServiceUrl:
    process.env.CAIL_PREDICTION_SERVICE_URL ?? 'http://localhost:3024',
  cailRecommendationServiceUrl:
    process.env.CAIL_RECOMMENDATION_SERVICE_URL ?? 'http://localhost:3025',
  cailExplainabilityServiceUrl:
    process.env.CAIL_EXPLAINABILITY_SERVICE_URL ?? 'http://localhost:3026',
  cailRealtimeServiceUrl: process.env.CAIL_REALTIME_SERVICE_URL ?? 'http://localhost:3027',
  inspectionServiceUrl: process.env.INSPECTION_SERVICE_URL ?? 'http://localhost:3028',
  incidentServiceUrl: process.env.INCIDENT_SERVICE_URL ?? 'http://localhost:3029',
  permitServiceUrl: process.env.PERMIT_SERVICE_URL ?? 'http://localhost:3030',
  cailModelTrainingServiceUrl:
    process.env.CAIL_MODEL_TRAINING_SERVICE_URL ?? 'http://localhost:3031',
  cailModelVersioningServiceUrl:
    process.env.CAIL_MODEL_VERSIONING_SERVICE_URL ?? 'http://localhost:3032',
  cailModelDriftServiceUrl:
    process.env.CAIL_MODEL_DRIFT_SERVICE_URL ?? 'http://localhost:3033',
  configServiceUrl: process.env.CONFIG_SERVICE_URL ?? 'http://localhost:3034',
  backendServiceUrl: process.env.BACKEND_SERVICE_URL ?? 'http://localhost:3000',
  routesConfigPath:
    process.env.ROUTES_CONFIG_PATH ??
    path.join(process.cwd(), 'config', 'routes.json'),
  authValidatePath: process.env.AUTH_VALIDATE_PATH ?? '/auth/validate-token',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  tokenCacheTtlMs: Number(process.env.TOKEN_CACHE_TTL_MS ?? 30_000),
  tokenCacheMax: Number(process.env.TOKEN_CACHE_MAX ?? 5000),
  rbacEvaluatePath: process.env.RBAC_EVALUATE_PATH ?? '/rbac/evaluate',
  rbacEnabled: process.env.RBAC_ENABLED !== 'false',
  auditServiceKey: process.env.AUDIT_SERVICE_KEY,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 200),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 30),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin,
  healthCheckTimeoutMs: Number(process.env.HEALTH_CHECK_TIMEOUT_MS ?? 3000),
};
