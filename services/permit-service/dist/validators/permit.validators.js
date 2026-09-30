"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncValidators = exports.approveValidators = exports.companyBodyValidators = exports.idParamValidators = exports.createValidators = void 0;
const express_validator_1 = require("express-validator");
const PERMIT_TYPES = ['hot_work', 'confined_space', 'excavation', 'electrical', 'general'];
exports.createValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('project_id').isUUID(),
    (0, express_validator_1.body)('work_package_id').optional().isUUID(),
    (0, express_validator_1.body)('pm_task_id').optional().isUUID(),
    (0, express_validator_1.body)('permit_type').optional().isIn(PERMIT_TYPES),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('jha_id').optional().isUUID(),
    (0, express_validator_1.body)('hazard_id').optional().isUUID(),
    (0, express_validator_1.body)('control_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('valid_from').optional().isISO8601(),
    (0, express_validator_1.body)('valid_to').optional().isISO8601(),
];
exports.idParamValidators = [(0, express_validator_1.param)('id').isUUID()];
exports.companyBodyValidators = [(0, express_validator_1.body)('company_id').optional().isUUID()];
exports.approveValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('role').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('outcome').optional().isIn(['approved', 'rejected']),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 4000 }),
];
exports.offlineSyncValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('device_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions').isArray(),
    (0, express_validator_1.body)('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions.*.action').isIn([
        'create',
        'request_approval',
        'approve',
        'activate',
        'suspend',
        'close',
    ]),
    (0, express_validator_1.body)('actions.*.payload').isObject(),
    (0, express_validator_1.body)('batch_id').optional().trim().isLength({ max: 128 }),
];
