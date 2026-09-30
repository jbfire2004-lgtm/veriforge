"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const env_1 = require("../config/env");
const auth_introspection_service_1 = require("../services/auth-introspection.service");
const errors_1 = require("../utils/errors");
const match_route_1 = require("./match-route");
function extractBearer(req) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer '))
        return header.slice(7);
    return undefined;
}
function hasAuditServiceKey(req) {
    if (!env_1.env.auditServiceKey)
        return false;
    return req.headers['x-audit-service-key'] === env_1.env.auditServiceKey;
}
async function authenticate(req, _res, next) {
    const route = req.matchedRoute;
    if (!route || route.auth === 'none') {
        return next();
    }
    const path = req.path;
    if (route.auth === 'public' && (0, match_route_1.isPublicPath)(route, path)) {
        return next();
    }
    const token = extractBearer(req);
    if (route.auth === 'optional') {
        if (!token && hasAuditServiceKey(req)) {
            return next();
        }
        if (!token) {
            return next(new errors_1.UnauthorizedError('Bearer token or service key required'));
        }
    }
    else if (!token) {
        return next(new errors_1.UnauthorizedError('Bearer token required'));
    }
    try {
        const payload = await auth_introspection_service_1.authIntrospection.validateToken(token);
        req.auth = payload;
        req.accessToken = token;
        return next();
    }
    catch (err) {
        return next(err);
    }
}
//# sourceMappingURL=authenticate.js.map