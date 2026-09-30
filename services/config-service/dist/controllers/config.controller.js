"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configController = void 0;
const config_service_1 = require("../services/config.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function authPayload(req) {
    return req.auth;
}
exports.configController = {
    async listNamespaces(_req, res, next) {
        try {
            const namespaces = await config_service_1.configService.listNamespaces();
            res.json({ namespaces });
        }
        catch (err) {
            next(err);
        }
    },
    async getEntry(req, res, next) {
        try {
            const entry = await config_service_1.configService.getEntry(authPayload(req), routeParam(req.params.namespace), routeParam(req.params.key), req.query.company_id);
            res.json(entry);
        }
        catch (err) {
            next(err);
        }
    },
    async listNamespace(req, res, next) {
        try {
            const namespace = routeParam(req.params.namespace);
            const entries = await config_service_1.configService.listNamespace(authPayload(req), namespace, req.query.company_id);
            res.json({ namespace, entries });
        }
        catch (err) {
            next(err);
        }
    },
    async upsert(req, res, next) {
        try {
            const body = req.body;
            const entry = await config_service_1.configService.upsert(authPayload(req), routeParam(req.params.namespace), routeParam(req.params.key), body.value, body.company_id, body.namespace_description);
            res.status(200).json(entry);
        }
        catch (err) {
            next(err);
        }
    },
    async remove(req, res, next) {
        try {
            const companyId = req.query.company_id;
            await config_service_1.configService.delete(authPayload(req), routeParam(req.params.namespace), routeParam(req.params.key), companyId === undefined ? undefined : companyId || null);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    },
};
