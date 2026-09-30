"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceCompanyScope = enforceCompanyScope;
const errors_1 = require("../utils/errors");
const match_route_1 = require("./match-route");
function collectCompanyIds(req) {
    const ids = [];
    const queryId = req.query.company_id;
    if (typeof queryId === 'string')
        ids.push(queryId);
    const headerId = req.headers['x-company-id'];
    if (typeof headerId === 'string')
        ids.push(headerId);
    // Body is not parsed at the gateway (streamed to upstream) — scope via query/header only.
    return ids;
}
function enforceCompanyScope(req, _res, next) {
    const route = req.matchedRoute;
    if (!route?.companyScope || !req.auth) {
        return next();
    }
    if (route.auth === 'public' && (0, match_route_1.isPublicPath)(route, req.path)) {
        return next();
    }
    const tokenCompanyId = req.auth.company_id;
    const requested = collectCompanyIds(req);
    if (requested.length === 0) {
        return next();
    }
    const mismatch = requested.some((id) => id !== tokenCompanyId);
    if (mismatch) {
        return next(new errors_1.ForbiddenError('Cross-company access denied'));
    }
    return next();
}
//# sourceMappingURL=company-scope.js.map