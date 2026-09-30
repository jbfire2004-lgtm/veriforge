import { body } from 'express-validator';

const companyBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    return true;
  }),
];

const stationIdBody = [
  body('station_id').optional().isUUID(),
  body('stationId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.station_id && !b.stationId) throw new Error('station_id or stationId is required');
    return true;
  }),
];

export const registerValidators = [
  ...companyBody,
  body('station_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('stationType').optional().trim().isLength({ min: 1, max: 64 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.station_type && !b.stationType) throw new Error('station_type or stationType is required');
    return true;
  }),
  body('hardware_id').optional().trim().isLength({ min: 1, max: 128 }),
  body('hardwareId').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.hardware_id && !b.hardwareId) throw new Error('hardware_id or hardwareId is required');
    return true;
  }),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body('firmware_version').optional().trim().isLength({ max: 64 }),
  body('firmwareVersion').optional().trim().isLength({ max: 64 }),
  body('location').optional().trim().isLength({ max: 256 }),
  body('zone_id').optional().isUUID(),
  body('zoneId').optional().isUUID(),
];

export const heartbeatValidators = [...companyBody, ...stationIdBody];

export const validateWorkerValidators = [
  ...companyBody,
  ...stationIdBody,
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    return true;
  }),
  body('required_jha_ids').optional().isArray(),
  body('requiredJhaIds').optional().isArray(),
  body('worker_context').optional().isObject(),
  body('workerContext').optional().isObject(),
];

export const validateEquipmentValidators = [
  ...companyBody,
  ...stationIdBody,
  body('equipment_id').optional().isUUID(),
  body('equipmentId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.equipment_id && !b.equipmentId) throw new Error('equipment_id or equipmentId is required');
    return true;
  }),
  body('equipment_context').optional().isObject(),
  body('equipmentContext').optional().isObject(),
];

export const musterValidators = [
  ...companyBody,
  ...stationIdBody,
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body('muster_point').optional().trim().isLength({ min: 1, max: 128 }),
  body('musterPoint').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    if (!b.muster_point && !b.musterPoint) throw new Error('muster_point or musterPoint is required');
    return true;
  }),
  body('notes').optional().trim().isLength({ max: 512 }),
];

export const emergencyValidators = [
  ...companyBody,
  body('mode').isIn(['muster', 'lockdown', 'evacuation', 'all_clear']),
  body('station_id').optional().isUUID(),
  body('stationId').optional().isUUID(),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.station_id && !b.stationId && !b.project_id && !b.projectId) {
      throw new Error('station_id/stationId or project_id/projectId is required');
    }
    return true;
  }),
];

export const offlineSyncValidators = [
  ...companyBody,
  ...stationIdBody,
  body('actions').isArray({ min: 1 }),
];
