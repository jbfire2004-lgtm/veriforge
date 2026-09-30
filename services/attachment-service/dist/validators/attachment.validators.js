"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamValidators = exports.getAttachmentValidators = exports.uploadValidators = void 0;
const express_validator_1 = require("express-validator");
exports.uploadValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('module_type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('module_record_id').isUUID(),
];
exports.getAttachmentValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.streamValidators = [(0, express_validator_1.param)('id').isUUID()];
//# sourceMappingURL=attachment.validators.js.map