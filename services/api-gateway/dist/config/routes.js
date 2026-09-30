"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRoutes = loadRoutes;
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./env");
const targetEnvMap = {
    AUTH_SERVICE_URL: env_1.env.authServiceUrl,
    RBAC_SERVICE_URL: env_1.env.rbacServiceUrl,
    AUDIT_SERVICE_URL: env_1.env.auditServiceUrl,
    ATTACHMENT_SERVICE_URL: env_1.env.attachmentServiceUrl,
    OFFLINE_SERVICE_URL: env_1.env.offlineServiceUrl,
    HAZARD_CONTROL_SERVICE_URL: env_1.env.hazardControlServiceUrl,
    JHA_SERVICE_URL: env_1.env.jhaServiceUrl,
    CORRECTIVE_ACTION_SERVICE_URL: env_1.env.correctiveActionServiceUrl,
    COMPANY_SAFETY_SERVICE_URL: env_1.env.companySafetyServiceUrl,
    PROJECT_SAFETY_SERVICE_URL: env_1.env.projectSafetyServiceUrl,
    WORKER_SAFETY_SERVICE_URL: env_1.env.workerSafetyServiceUrl,
    TRAINING_SERVICE_URL: env_1.env.trainingServiceUrl,
    EQUIPMENT_SAFETY_SERVICE_URL: env_1.env.equipmentSafetyServiceUrl,
    ACCESS_CONTROL_SERVICE_URL: env_1.env.accessControlServiceUrl,
    SAFETY_STATIONS_SERVICE_URL: env_1.env.safetyStationsServiceUrl,
    SDS_SERVICE_URL: env_1.env.sdsServiceUrl,
    EMERGENCY_SERVICE_URL: env_1.env.emergencyServiceUrl,
    PM_PROJECT_SERVICE_URL: env_1.env.pmProjectServiceUrl,
    PM_WORK_PACKAGE_SERVICE_URL: env_1.env.pmWorkPackageServiceUrl,
    PM_TASK_SERVICE_URL: env_1.env.pmTaskServiceUrl,
    PM_SCHEDULE_SERVICE_URL: env_1.env.pmScheduleServiceUrl,
    CAIL_INGESTION_SERVICE_URL: env_1.env.cailIngestionServiceUrl,
    CAIL_SCORING_SERVICE_URL: env_1.env.cailScoringServiceUrl,
    CAIL_PREDICTION_SERVICE_URL: env_1.env.cailPredictionServiceUrl,
    CAIL_RECOMMENDATION_SERVICE_URL: env_1.env.cailRecommendationServiceUrl,
    CAIL_EXPLAINABILITY_SERVICE_URL: env_1.env.cailExplainabilityServiceUrl,
    CAIL_REALTIME_SERVICE_URL: env_1.env.cailRealtimeServiceUrl,
    INSPECTION_SERVICE_URL: env_1.env.inspectionServiceUrl,
    INCIDENT_SERVICE_URL: env_1.env.incidentServiceUrl,
    PERMIT_SERVICE_URL: env_1.env.permitServiceUrl,
    CAIL_MODEL_TRAINING_SERVICE_URL: env_1.env.cailModelTrainingServiceUrl,
    CAIL_MODEL_VERSIONING_SERVICE_URL: env_1.env.cailModelVersioningServiceUrl,
    CAIL_MODEL_DRIFT_SERVICE_URL: env_1.env.cailModelDriftServiceUrl,
    CONFIG_SERVICE_URL: env_1.env.configServiceUrl,
    BACKEND_SERVICE_URL: env_1.env.backendServiceUrl,
};
function resolveTarget(def) {
    if (def.target)
        return def.target;
    const fromEnv = def.targetEnv ? targetEnvMap[def.targetEnv] : undefined;
    if (!fromEnv) {
        throw new Error(`Route "${def.id}": unknown targetEnv "${def.targetEnv}"`);
    }
    return fromEnv.replace(/\/$/, '');
}
function loadRoutes() {
    const raw = fs_1.default.readFileSync(env_1.env.routesConfigPath, 'utf8');
    const definitions = JSON.parse(raw);
    const routes = definitions.map((def) => ({
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
//# sourceMappingURL=routes.js.map