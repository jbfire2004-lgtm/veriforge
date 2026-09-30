"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const routes_1 = require("./config/routes");
const request_id_1 = require("./middleware/request-id");
const request_logger_1 = require("./middleware/request-logger");
const rate_limit_1 = require("./middleware/rate-limit");
const match_route_1 = require("./middleware/match-route");
const authenticate_1 = require("./middleware/authenticate");
const company_scope_1 = require("./middleware/company-scope");
const rbac_enforce_1 = require("./middleware/rbac-enforce");
const error_handler_1 = require("./middleware/error-handler");
const health_routes_1 = require("./routes/health.routes");
const create_proxy_1 = require("./proxy/create-proxy");
const errors_1 = require("./utils/errors");
function createApp() {
    const routes = (0, routes_1.loadRoutes)();
    const proxies = new Map(routes.map((r) => [r.id, (0, create_proxy_1.createRouteProxy)(r)]));
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.corsOrigin === '*' ? true : env_1.env.corsOrigin.split(','),
        credentials: true,
    }));
    app.disable('x-powered-by');
    app.use(request_id_1.requestIdMiddleware);
    app.use(request_logger_1.requestLogger);
    app.use('/health', health_routes_1.healthRouter);
    app.use((req, res, next) => {
        if (req.path.startsWith('/auth')) {
            return (0, rate_limit_1.authRateLimiter)(req, res, next);
        }
        return (0, rate_limit_1.globalRateLimiter)(req, res, next);
    });
    app.use((0, match_route_1.createRouteMatcher)(routes));
    app.use(authenticate_1.authenticate);
    app.use(company_scope_1.enforceCompanyScope);
    app.use(rbac_enforce_1.enforceRbac);
    app.use((req, res, next) => {
        const route = req.matchedRoute;
        if (!route) {
            return next(new errors_1.GatewayError(404, `No route configured for ${req.path}`, 'NOT_FOUND'));
        }
        const proxy = proxies.get(route.id);
        if (!proxy) {
            return next(new errors_1.GatewayError(502, 'Proxy not configured', 'BAD_GATEWAY'));
        }
        return proxy(req, res, next);
    });
    app.use(error_handler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map