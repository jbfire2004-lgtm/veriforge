"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventValidators = exports.listEventsValidators = exports.ingestEventValidators = void 0;
const express_validator_1 = require("express-validator");
const MAX_EVENT_DATA_BYTES = 256 * 1024;
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
exports.ingestEventValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('module').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('event_type').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actor_id').isUUID(),
    (0, express_validator_1.body)('event_data')
        .custom((value) => {
        if (!isPlainObject(value)) {
            throw new Error('event_data must be a JSON object');
        }
        const size = Buffer.byteLength(JSON.stringify(value), 'utf8');
        if (size > MAX_EVENT_DATA_BYTES) {
            throw new Error(`event_data exceeds ${MAX_EVENT_DATA_BYTES} bytes`);
        }
        return true;
    }),
];
exports.listEventsValidators = [
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('module').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.query)('actor_id').optional().isUUID(),
    (0, express_validator_1.query)('event_type').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 200 }),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }),
    (0, express_validator_1.query)('from').optional().isISO8601(),
    (0, express_validator_1.query)('to').optional().isISO8601(),
];
exports.getEventValidators = [(0, express_validator_1.param)('id').isUUID()];
//# sourceMappingURL=audit.validators.js.map