"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulterExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const api_contract_1 = require("@vera/api-contract");
const multer_1 = require("multer");
const core_upload_config_1 = require("../core-upload.config");
let MulterExceptionFilter = class MulterExceptionFilter {
    catch(exception, host) {
        var _a, _b;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const maxBytes = (0, core_upload_config_1.getCoreUploadConfig)().maxBytes;
        const mib = Math.round(maxBytes / (1024 * 1024));
        if (exception.code === 'LIMIT_FILE_SIZE') {
            const message = `File too large (max ${maxBytes} bytes / ~${mib} MiB). Increase VERA_CORE_UPLOAD_MAX_BYTES if needed.`;
            const error = (0, api_contract_1.toCanonicalApiError)(message, common_1.HttpStatus.PAYLOAD_TOO_LARGE);
            return response.status(common_1.HttpStatus.PAYLOAD_TOO_LARGE).json({
                status: 'error',
                success: false,
                statusCode: common_1.HttpStatus.PAYLOAD_TOO_LARGE,
                code: error.code,
                message: error.message,
                errors: [
                    { code: (_a = error.code) !== null && _a !== void 0 ? _a : 'ERROR', message: error.message },
                ],
                error,
                timestamp: new Date().toISOString(),
            });
        }
        const error = (0, api_contract_1.toCanonicalApiError)(exception.message || 'Upload rejected', common_1.HttpStatus.BAD_REQUEST);
        return response.status(common_1.HttpStatus.BAD_REQUEST).json({
            status: 'error',
            success: false,
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            code: error.code,
            message: error.message,
            errors: [{ code: (_b = error.code) !== null && _b !== void 0 ? _b : 'ERROR', message: error.message }],
            error,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.MulterExceptionFilter = MulterExceptionFilter;
exports.MulterExceptionFilter = MulterExceptionFilter = __decorate([
    (0, common_1.Catch)(multer_1.MulterError)
], MulterExceptionFilter);
//# sourceMappingURL=multer-exception.filter.js.map