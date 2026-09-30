"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        logger_1.logger.info('gateway request', {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            userId: req.auth?.user_id,
            companyId: req.auth?.company_id,
            routeId: req.matchedRoute?.id,
        });
    });
    next();
}
//# sourceMappingURL=request-logger.js.map