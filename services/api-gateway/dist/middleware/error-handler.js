"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, _next) {
    if (res.headersSent) {
        return;
    }
    const body = {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        requestId: req.requestId,
    };
    if (err instanceof errors_1.GatewayError) {
        body.error = err.message;
        body.code = err.code;
        if (err.details)
            body.details = err.details;
        return res.status(err.statusCode).json(body);
    }
    logger_1.logger.error('unhandled gateway error', {
        requestId: req.requestId,
        path: req.path,
        error: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json(body);
}
//# sourceMappingURL=error-handler.js.map