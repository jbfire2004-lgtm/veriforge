"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoreUploadConfig = getCoreUploadConfig;
const core_upload_constants_1 = require("./core-upload.constants");
function getCoreUploadConfig() {
    var _a, _b;
    const rawMode = (process.env.VERA_CORE_UPLOAD_MODE || 'local').toLowerCase();
    const mode = rawMode === 's3' || rawMode === 'direct' || rawMode === 'local'
        ? rawMode
        : 'local';
    const maxBytes = Math.min(Math.max(1, parseInt(process.env.VERA_CORE_UPLOAD_MAX_BYTES ||
        String(core_upload_constants_1.VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES), 10) || core_upload_constants_1.VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES), core_upload_constants_1.VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES);
    const allowedMimeTypes = new Set((process.env.VERA_CORE_UPLOAD_ALLOWED_MIMES ||
        core_upload_constants_1.VERA_CORE_UPLOAD_DEFAULT_MIMES_CSV)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean));
    const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
    const awsBucket = process.env.AWS_S3_BUCKET || process.env.VERA_S3_BUCKET || '';
    const publicAssetBase = ((_a = process.env.VERA_S3_PUBLIC_BASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, '')) ||
        ((_b = process.env.S3_PUBLIC_URL_PREFIX) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, '')) ||
        null;
    return {
        mode,
        maxBytes,
        allowedMimeTypes,
        awsRegion,
        awsBucket,
        publicAssetBase,
    };
}
//# sourceMappingURL=core-upload.config.js.map