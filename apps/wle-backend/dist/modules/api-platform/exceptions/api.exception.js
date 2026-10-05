"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiException = void 0;
const common_1 = require("@nestjs/common");
const STATUS_BY_CODE = {
    VALIDATION_ERROR: common_1.HttpStatus.BAD_REQUEST,
    NOT_FOUND: common_1.HttpStatus.NOT_FOUND,
    UNAUTHORIZED: common_1.HttpStatus.UNAUTHORIZED,
    FORBIDDEN: common_1.HttpStatus.FORBIDDEN,
    CONFLICT: common_1.HttpStatus.CONFLICT,
    BAD_REQUEST: common_1.HttpStatus.BAD_REQUEST,
    INTERNAL_ERROR: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    RATE_LIMITED: common_1.HttpStatus.TOO_MANY_REQUESTS,
    OFFLINE_SYNC_CONFLICT: common_1.HttpStatus.CONFLICT,
};
class ApiException extends common_1.HttpException {
    constructor(code, message, details, statusOverride) {
        var _a;
        const status = (_a = statusOverride !== null && statusOverride !== void 0 ? statusOverride : STATUS_BY_CODE[code]) !== null && _a !== void 0 ? _a : common_1.HttpStatus.BAD_REQUEST;
        super({ code, message, details }, status);
    }
}
exports.ApiException = ApiException;
//# sourceMappingURL=api.exception.js.map