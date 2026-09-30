"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncValidators = exports.emergencyValidators = exports.musterValidators = exports.validateEquipmentValidators = exports.validateWorkerValidators = exports.heartbeatValidators = exports.registerValidators = void 0;
const express_validator_1 = require("express-validator");
const companyBody = [
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('companyId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.company_id && !b.companyId)
            throw new Error('company_id or companyId is required');
        return true;
    }),
];
const stationIdBody = [
    (0, express_validator_1.body)('station_id').optional().isUUID(),
    (0, express_validator_1.body)('stationId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.station_id && !b.stationId)
            throw new Error('station_id or stationId is required');
        return true;
    }),
];
exports.registerValidators = [
    ...companyBody,
    (0, express_validator_1.body)('station_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('stationType').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.station_type && !b.stationType)
            throw new Error('station_type or stationType is required');
        return true;
    }),
    (0, express_validator_1.body)('hardware_id').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('hardwareId').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.hardware_id && !b.hardwareId)
            throw new Error('hardware_id or hardwareId is required');
        return true;
    }),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)('firmware_version').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('firmwareVersion').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 256 }),
    (0, express_validator_1.body)('zone_id').optional().isUUID(),
    (0, express_validator_1.body)('zoneId').optional().isUUID(),
];
exports.heartbeatValidators = [...companyBody, ...stationIdBody];
exports.validateWorkerValidators = [
    ...companyBody,
    ...stationIdBody,
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        return true;
    }),
    (0, express_validator_1.body)('required_jha_ids').optional().isArray(),
    (0, express_validator_1.body)('requiredJhaIds').optional().isArray(),
    (0, express_validator_1.body)('worker_context').optional().isObject(),
    (0, express_validator_1.body)('workerContext').optional().isObject(),
];
exports.validateEquipmentValidators = [
    ...companyBody,
    ...stationIdBody,
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('equipmentId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.equipment_id && !b.equipmentId)
            throw new Error('equipment_id or equipmentId is required');
        return true;
    }),
    (0, express_validator_1.body)('equipment_context').optional().isObject(),
    (0, express_validator_1.body)('equipmentContext').optional().isObject(),
];
exports.musterValidators = [
    ...companyBody,
    ...stationIdBody,
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)('muster_point').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('musterPoint').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        if (!b.muster_point && !b.musterPoint)
            throw new Error('muster_point or musterPoint is required');
        return true;
    }),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 512 }),
];
exports.emergencyValidators = [
    ...companyBody,
    (0, express_validator_1.body)('mode').isIn(['muster', 'lockdown', 'evacuation', 'all_clear']),
    (0, express_validator_1.body)('station_id').optional().isUUID(),
    (0, express_validator_1.body)('stationId').optional().isUUID(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.station_id && !b.stationId && !b.project_id && !b.projectId) {
            throw new Error('station_id/stationId or project_id/projectId is required');
        }
        return true;
    }),
];
exports.offlineSyncValidators = [
    ...companyBody,
    ...stationIdBody,
    (0, express_validator_1.body)('actions').isArray({ min: 1 }),
];
