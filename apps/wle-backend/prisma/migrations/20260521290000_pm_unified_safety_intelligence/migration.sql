-- Unified Safety Intelligence Engine (CAIL master layer)

CREATE TYPE "CailIntelEntityType" AS ENUM (
  'company', 'project', 'worker', 'equipment', 'hazard', 'control',
  'jha_flha', 'inspection', 'incident', 'corrective_action', 'sds',
  'training', 'site_access', 'emergency', 'pm_task', 'zone'
);

CREATE TYPE "CailIntelPredictionType" AS ENUM (
  'incident_likelihood', 'equipment_failure', 'hazard_emergence',
  'sif_heca_potential', 'worker_risk', 'project_risk', 'company_risk',
  'schedule_delay', 'access_denial', 'emergency_likelihood',
  'capa_overdue', 'training_lapse'
);

CREATE TYPE "CailIntelScoreType" AS ENUM (
  'worker_safety', 'equipment_safety', 'project_safety', 'company_safety',
  'hazard_severity', 'control_strength', 'jha_quality', 'inspection_quality',
  'incident_severity', 'capa_priority', 'emergency_readiness', 'access_compliance'
);

CREATE TYPE "CailIntelRecommendationType" AS ENUM (
  'control', 'training', 'corrective_action', 'equipment_maintenance',
  'jha_improvement', 'inspection_focus', 'emergency_plan', 'sds_update',
  'worker_assignment', 'equipment_assignment', 'pm_schedule_adjustment'
);

CREATE TYPE "CailIntelInferenceMode" AS ENUM ('realtime', 'batch', 'edge', 'offline');

CREATE TYPE "CailIntelModelStatus" AS ENUM (
  'draft', 'training', 'validated', 'deployed', 'deprecated', 'rolled_back'
);

CREATE TABLE "cail_models" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER,
  "modelKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "CailIntelModelStatus" NOT NULL DEFAULT 'draft',
  "activeVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "cail_models_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_model_versions" (
  "id" TEXT NOT NULL,
  "modelId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "algorithm" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
  "parametersJson" JSONB NOT NULL DEFAULT '{}',
  "metricsJson" JSONB NOT NULL DEFAULT '{}',
  "deployedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cail_model_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_model_audit" (
  "id" TEXT NOT NULL,
  "modelId" TEXT NOT NULL,
  "version" INTEGER,
  "eventType" TEXT NOT NULL,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cail_model_audit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_training_data" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "sourceModule" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "featureJson" JSONB NOT NULL,
  "labelJson" JSONB,
  "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "taggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "cail_training_data_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_predictions" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "entityType" "CailIntelEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "predictionType" "CailIntelPredictionType" NOT NULL,
  "probability" DOUBLE PRECISION NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
  "modelVersion" INTEGER NOT NULL DEFAULT 1,
  "inferenceMode" "CailIntelInferenceMode" NOT NULL,
  "factorsJson" JSONB NOT NULL DEFAULT '[]',
  "validUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "cail_predictions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_scores" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "entityType" "CailIntelEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "scoreType" "CailIntelScoreType" NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "componentsJson" JSONB NOT NULL DEFAULT '{}',
  "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
  "modelVersion" INTEGER NOT NULL DEFAULT 1,
  "inferenceMode" "CailIntelInferenceMode" NOT NULL,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "cail_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_recommendations" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "entityType" "CailIntelEntityType",
  "entityId" TEXT,
  "recommendationType" "CailIntelRecommendationType" NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "evidenceJson" JSONB NOT NULL DEFAULT '[]',
  "confidence" DOUBLE PRECISION NOT NULL,
  "requiredActionsJson" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'open',
  "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "cail_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_correlations" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "leftModule" TEXT NOT NULL,
  "leftEntityId" TEXT NOT NULL,
  "rightModule" TEXT NOT NULL,
  "rightEntityId" TEXT NOT NULL,
  "correlationType" TEXT NOT NULL,
  "strength" DOUBLE PRECISION NOT NULL,
  "evidenceJson" JSONB NOT NULL DEFAULT '[]',
  "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "cail_correlations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_explainability" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "predictionId" TEXT,
  "scoreId" TEXT,
  "summary" TEXT NOT NULL,
  "whyJson" JSONB NOT NULL,
  "dataSourcesJson" JSONB NOT NULL DEFAULT '[]',
  "hazardFactorsJson" JSONB NOT NULL DEFAULT '[]',
  "controlFactorsJson" JSONB NOT NULL DEFAULT '[]',
  "workerFactorsJson" JSONB NOT NULL DEFAULT '[]',
  "equipmentFactorsJson" JSONB NOT NULL DEFAULT '[]',
  "projectFactorsJson" JSONB NOT NULL DEFAULT '[]',
  "confidence" DOUBLE PRECISION NOT NULL,
  "recommendedActionsJson" JSONB NOT NULL DEFAULT '[]',
  "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cail_explainability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_inference_logs" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "inferenceMode" "CailIntelInferenceMode" NOT NULL,
  "engineLayer" TEXT NOT NULL,
  "inputHash" TEXT,
  "outputSummary" TEXT,
  "durationMs" INTEGER,
  "actorId" INTEGER,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cail_inference_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cail_offline_cache" (
  "id" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "projectId" INTEGER,
  "cacheKey" TEXT NOT NULL,
  "cacheVersion" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "modelVersionsJson" JSONB NOT NULL DEFAULT '{}',
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cail_offline_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cail_models_companyId_modelKey_key" ON "cail_models"("companyId", "modelKey");
CREATE INDEX "cail_models_status_idx" ON "cail_models"("status");
CREATE UNIQUE INDEX "cail_model_versions_modelId_version_key" ON "cail_model_versions"("modelId", "version");
CREATE INDEX "cail_model_audit_modelId_createdAt_idx" ON "cail_model_audit"("modelId", "createdAt");
CREATE INDEX "cail_training_data_companyId_sourceModule_idx" ON "cail_training_data"("companyId", "sourceModule");
CREATE INDEX "cail_predictions_companyId_projectId_predictionType_idx" ON "cail_predictions"("companyId", "projectId", "predictionType");
CREATE INDEX "cail_scores_entityType_entityId_scoreType_idx" ON "cail_scores"("entityType", "entityId", "scoreType");
CREATE INDEX "cail_recommendations_companyId_projectId_status_idx" ON "cail_recommendations"("companyId", "projectId", "status");
CREATE INDEX "cail_correlations_leftModule_leftEntityId_idx" ON "cail_correlations"("leftModule", "leftEntityId");
CREATE INDEX "cail_explainability_companyId_targetType_targetId_idx" ON "cail_explainability"("companyId", "targetType", "targetId");
CREATE INDEX "cail_inference_logs_companyId_createdAt_idx" ON "cail_inference_logs"("companyId", "createdAt");
CREATE UNIQUE INDEX "cail_offline_cache_cacheKey_key" ON "cail_offline_cache"("cacheKey");

ALTER TABLE "cail_models" ADD CONSTRAINT "cail_models_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_model_versions" ADD CONSTRAINT "cail_model_versions_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "cail_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_model_audit" ADD CONSTRAINT "cail_model_audit_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "cail_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_model_audit" ADD CONSTRAINT "cail_model_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cail_training_data" ADD CONSTRAINT "cail_training_data_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_training_data" ADD CONSTRAINT "cail_training_data_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_predictions" ADD CONSTRAINT "cail_predictions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_predictions" ADD CONSTRAINT "cail_predictions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_scores" ADD CONSTRAINT "cail_scores_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_scores" ADD CONSTRAINT "cail_scores_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_recommendations" ADD CONSTRAINT "cail_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_recommendations" ADD CONSTRAINT "cail_recommendations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_correlations" ADD CONSTRAINT "cail_correlations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_correlations" ADD CONSTRAINT "cail_correlations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_explainability" ADD CONSTRAINT "cail_explainability_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_explainability" ADD CONSTRAINT "cail_explainability_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_inference_logs" ADD CONSTRAINT "cail_inference_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_inference_logs" ADD CONSTRAINT "cail_inference_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_inference_logs" ADD CONSTRAINT "cail_inference_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cail_offline_cache" ADD CONSTRAINT "cail_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cail_offline_cache" ADD CONSTRAINT "cail_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
