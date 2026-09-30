"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadGatewayError = exports.TooManyRequestsError = exports.ForbiddenError = exports.UnauthorizedError = exports.GatewayError = void 0;
class GatewayError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, message, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'GatewayError';
    }
}
exports.GatewayError = GatewayError;
class UnauthorizedError extends GatewayError {
    constructor(message = 'Unauthorized', details) {
        super(401, message, 'UNAUTHORIZED', details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends GatewayError {
    constructor(message = 'Forbidden', details) {
        super(403, message, 'FORBIDDEN', details);
    }
}
exports.ForbiddenError = ForbiddenError;
class TooManyRequestsError extends GatewayError {
    constructor(message = 'Too many requests') {
        super(429, message, 'RATE_LIMITED');
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class BadGatewayError extends GatewayError {
    constructor(message = 'Upstream service unavailable') {
        super(502, message, 'BAD_GATEWAY');
    }
}
exports.BadGatewayError = BadGatewayError;
//# sourceMappingURL=errors.js.map