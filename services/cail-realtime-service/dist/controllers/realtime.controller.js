"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeController = void 0;
const realtime_service_1 = require("../services/realtime.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.realtimeController = {
    async predict(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await realtime_service_1.realtimeService.predict({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                predictionType: req.body.prediction_type ?? req.body.predictionType,
                signals: realtime_service_1.realtimeService.parseSignals(req.body),
            });
            return res.status(200).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async score(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await realtime_service_1.realtimeService.score({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                scoreType: req.body.score_type ?? req.body.scoreType,
                signals: realtime_service_1.realtimeService.parseSignals(req.body),
            });
            return res.status(200).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async gate(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await realtime_service_1.realtimeService.gate({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                zoneCode: req.body.zone_code ?? req.body.zoneCode,
                signals: realtime_service_1.realtimeService.parseSignals(req.body),
                taskRequirements: realtime_service_1.realtimeService.parseTaskRequirements(req.body),
                taskGateContext: realtime_service_1.realtimeService.parseTaskGateContext(req.body),
                activeOverrides: realtime_service_1.realtimeService.parseOverrides(req.body),
                useCase: req.body.use_case ?? req.body.useCase,
            });
            return res.status(200).json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
