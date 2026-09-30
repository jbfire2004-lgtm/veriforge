"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineController = void 0;
const offline_service_1 = require("../services/offline.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.offlineController = {
    async sync(req, res, next) {
        try {
            const companyId = req.body.company_id;
            offline_service_1.offlineService.assertCompanyAccess(req.companyId, companyId);
            const actions = req.body.actions ?? [];
            const result = await offline_service_1.offlineService.sync({
                deviceId: req.body.device_id,
                companyId,
                userId: req.userId,
                batchId: req.body.batch_id,
                actions: actions.map((a) => ({
                    type: a.type,
                    recordId: a.recordId,
                    payload: a.payload ?? {},
                    clientVersion: a.clientVersion,
                    lastModified: a.lastModified,
                })),
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async resolveConflict(req, res, next) {
        try {
            const companyId = req.body.company_id;
            offline_service_1.offlineService.assertCompanyAccess(req.companyId, companyId);
            const conflict = await offline_service_1.offlineService.resolveConflict({
                conflictId: req.body.conflict_id,
                companyId,
                userId: req.userId,
                strategy: req.body.strategy,
                resolvedValue: req.body.resolved_value,
                retrySync: req.body.retry_sync,
            });
            return res.json(conflict);
        }
        catch (e) {
            next(e);
        }
    },
    async getDevice(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            offline_service_1.offlineService.assertCompanyAccess(req.companyId, companyId);
            const since = req.query.since ? new Date(req.query.since) : undefined;
            const status = await offline_service_1.offlineService.getDeviceStatus(routeParam(req.params.id), companyId, since);
            return res.json(status);
        }
        catch (e) {
            next(e);
        }
    },
};
