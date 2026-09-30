"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = void 0;
const audit_service_1 = require("../services/audit.service");
const env_1 = require("../config/env");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.auditController = {
    async ingestEvent(req, res, next) {
        try {
            const companyId = req.body.company_id;
            if (!req.isServiceCaller) {
                audit_service_1.auditService.assertCompanyAccess(req.companyId, companyId);
            }
            const event = await audit_service_1.auditService.ingestEvent({
                companyId,
                module: req.body.module,
                eventType: req.body.event_type,
                actorId: req.body.actor_id,
                eventData: req.body.event_data,
            });
            return res.status(201).json(event);
        }
        catch (e) {
            next(e);
        }
    },
    async listEvents(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            audit_service_1.auditService.assertCompanyAccess(req.companyId, companyId);
            const limit = Math.min(Number(req.query.limit ?? env_1.env.defaultLimit), env_1.env.maxLimit);
            const offset = Number(req.query.offset ?? 0);
            const result = await audit_service_1.auditService.listEvents({
                companyId,
                module: req.query.module,
                actorId: req.query.actor_id,
                eventType: req.query.event_type,
                limit,
                offset,
                from: req.query.from ? new Date(req.query.from) : undefined,
                to: req.query.to ? new Date(req.query.to) : undefined,
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async getEvent(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            audit_service_1.auditService.assertCompanyAccess(req.companyId, companyId);
            const event = await audit_service_1.auditService.getEvent(companyId, routeParam(req.params.id));
            return res.json(event);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=audit.controller.js.map