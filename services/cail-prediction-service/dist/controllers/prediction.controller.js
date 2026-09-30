"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionController = void 0;
const prediction_types_1 = require("../config/prediction-types");
const env_1 = require("../config/env");
const prediction_service_1 = require("../services/prediction.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.predictionController = {
    async predict(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const signals = prediction_service_1.predictionService.parseSignals(req.body);
            const predictionTypes = req.body.prediction_types ?? req.body.predictionTypes;
            if (Array.isArray(predictionTypes) && predictionTypes.length > 0) {
                const entityId = String(req.body.entity_id ?? req.body.entityId);
                const entityType = (req.body.entity_type ?? req.body.entityType);
                const requests = predictionTypes.map((pt) => ({
                    predictionType: pt,
                    entityType: entityType ?? prediction_types_1.PREDICTION_TO_ENTITY[pt],
                    entityId,
                    moduleType: req.body.module_type ?? req.body.moduleType ?? prediction_types_1.PREDICTION_TO_MODULE[pt],
                    projectId: req.body.project_id ?? req.body.projectId,
                    workerId: req.body.worker_id ?? req.body.workerId,
                    equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                    signals,
                }));
                const predictions = await prediction_service_1.predictionService.predictBatch(companyId, requests);
                return res.status(201).json({ predictions, modelKey: env_1.env.modelKey });
            }
            const predictionType = (req.body.prediction_type ?? req.body.predictionType);
            const entityId = String(req.body.entity_id ?? req.body.entityId);
            const entityType = (req.body.entity_type ??
                req.body.entityType ??
                prediction_types_1.PREDICTION_TO_ENTITY[predictionType]);
            const input = {
                companyId,
                predictionType,
                entityType,
                entityId,
                moduleType: req.body.module_type ?? req.body.moduleType ?? prediction_types_1.PREDICTION_TO_MODULE[predictionType],
                projectId: req.body.project_id ?? req.body.projectId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                signals,
            };
            const prediction = await prediction_service_1.predictionService.predictAndStore(input);
            return res.status(201).json({ prediction, modelKey: env_1.env.modelKey });
        }
        catch (e) {
            next(e);
        }
    },
    async getByEntity(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await prediction_service_1.predictionService.getByEntity(companyId, routeParam(req.params.entity_type), routeParam(req.params.id), req.query.prediction_type);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
