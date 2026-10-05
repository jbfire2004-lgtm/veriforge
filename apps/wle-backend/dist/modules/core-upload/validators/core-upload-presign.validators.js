"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCoreUploadAllowedMime = IsCoreUploadAllowedMime;
exports.IsCoreUploadSizeWithinConfiguredMax = IsCoreUploadSizeWithinConfiguredMax;
const class_validator_1 = require("class-validator");
const core_upload_config_1 = require("../core-upload.config");
function IsCoreUploadAllowedMime(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'isCoreUploadAllowedMime',
        validator: {
            validate: (value) => typeof value === 'string' &&
                (0, core_upload_config_1.getCoreUploadConfig)().allowedMimeTypes.has(value),
            defaultMessage: () => `mimeType not allowed. Allowed: ${[
                ...(0, core_upload_config_1.getCoreUploadConfig)().allowedMimeTypes,
            ].join(', ')}`,
        },
    }, validationOptions);
}
function IsCoreUploadSizeWithinConfiguredMax(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'isCoreUploadSizeWithinConfiguredMax',
        validator: {
            validate: (value) => typeof value === 'number' &&
                value >= 1 &&
                value <= (0, core_upload_config_1.getCoreUploadConfig)().maxBytes,
            defaultMessage: () => {
                const max = (0, core_upload_config_1.getCoreUploadConfig)().maxBytes;
                return `sizeBytes must not exceed configured maximum (${max} bytes)`;
            },
        },
    }, validationOptions);
}
//# sourceMappingURL=core-upload-presign.validators.js.map