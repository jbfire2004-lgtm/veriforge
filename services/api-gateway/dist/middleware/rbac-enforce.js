"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceRbac = enforceRbac;
const rbac_evaluation_service_1 = require("../services/rbac-evaluation.service");
const match_route_1 = require("./match-route");
async function enforceRbac(req, _res, next) {
    const route = req.matchedRoute;
    if (!route?.rbac || !req.auth || !req.accessToken) {
        return next();
    }
    if (route.auth === 'public' && (0, match_route_1.isPublicPath)(route, req.path)) {
        return next();
    }
    try {
        await rbac_evaluation_service_1.rbacEvaluation.evaluateFromRequest(req.accessToken, req.auth.user_id, req.auth.company_id, route.rbac.resource, req.method);
        return next();
    }
    catch (err) {
        return next(err);
    }
}
//# sourceMappingURL=rbac-enforce.js.map