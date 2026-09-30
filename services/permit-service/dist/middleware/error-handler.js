"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidation = handleValidation;
exports.errorHandler = errorHandler;
const express_validator_1 = require("express-validator");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function handleValidation(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors.array(),
        });
    }
    next();
}
function errorHandler(err, req, res, _next) {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ error: err.message, code: err.code });
    }
    logger_1.logger.error('unhandled error', {
        path: req.path,
        error: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
