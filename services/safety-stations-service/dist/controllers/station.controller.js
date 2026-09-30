"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stationController = void 0;
const station_service_1 = require("../services/station.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function bearerToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
exports.stationController = {
    async register(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const station = await station_service_1.stationService.register({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                stationType: req.body.station_type ?? req.body.stationType,
                hardwareId: req.body.hardware_id ?? req.body.hardwareId,
                firmwareVersion: req.body.firmware_version ?? req.body.firmwareVersion,
                location: req.body.location,
                zoneId: req.body.zone_id ?? req.body.zoneId,
            });
            return res.status(201).json(station);
        }
        catch (e) {
            next(e);
        }
    },
    async heartbeat(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const station = await station_service_1.stationService.heartbeat({
                companyId,
                stationId: req.body.station_id ?? req.body.stationId,
                firmwareVersion: req.body.firmware_version ?? req.body.firmwareVersion,
                recordedAt: req.body.recorded_at ?? req.body.recordedAt,
            });
            return res.json(station);
        }
        catch (e) {
            next(e);
        }
    },
    async validateWorker(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await station_service_1.stationService.validateWorker({
                companyId,
                stationId: req.body.station_id ?? req.body.stationId,
                workerId: req.body.worker_id ?? req.body.workerId,
                requiredJhaIds: req.body.required_jha_ids ?? req.body.requiredJhaIds,
                workerContext: req.body.worker_context ?? req.body.workerContext,
            }, bearerToken(req));
            return res.status(result.granted ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async validateEquipment(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await station_service_1.stationService.validateEquipment({
                companyId,
                stationId: req.body.station_id ?? req.body.stationId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                equipmentContext: req.body.equipment_context ?? req.body.equipmentContext,
            }, bearerToken(req));
            return res.status(result.granted ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async musterCheckin(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const checkin = await station_service_1.stationService.musterCheckin({
                companyId,
                stationId: req.body.station_id ?? req.body.stationId,
                workerId: req.body.worker_id ?? req.body.workerId,
                musterPoint: req.body.muster_point ?? req.body.musterPoint,
                notes: req.body.notes,
            });
            return res.status(201).json(checkin);
        }
        catch (e) {
            next(e);
        }
    },
    async emergencyMode(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await station_service_1.stationService.setEmergencyMode({
                companyId,
                stationId: req.body.station_id ?? req.body.stationId,
                projectId: req.body.project_id ?? req.body.projectId,
                mode: req.body.mode,
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async offlineSync(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await station_service_1.stationService.offlineSync({
                companyId,
                stationId: req.body.station_id ?? req.body.stationId,
                token: bearerToken(req),
                actions: req.body.actions ?? [],
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
