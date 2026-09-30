import { body, param } from 'express-validator';

export const createHazardValidators = [
  body('company_id').isUUID(),
  body('hazard_type').trim().isLength({ min: 1, max: 64 }),
  body('category').trim().isLength({ min: 1, max: 64 }),
  body('energy_type').trim().isLength({ min: 1, max: 32 }),
  body('severity').isInt({ min: 1, max: 5 }),
  body('likelihood').isInt({ min: 1, max: 5 }),
  body('title').optional().trim().isLength({ max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('required_controls').optional().isArray(),
  body('required_training').optional().isArray(),
  body('required_ppe').optional().isArray(),
];

export const createControlValidators = [
  body('company_id').isUUID(),
  body('control_type').trim().isLength({ min: 1, max: 64 }),
  body('hierarchy_level').isInt({ min: 1, max: 5 }),
  body('control_strength').isInt({ min: 1, max: 5 }),
  body('verification_steps').optional().isArray(),
  body('required_training').optional().isArray(),
  body('required_ppe').optional().isArray(),
  body('title').optional().trim().isLength({ max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
];

export const mapControlsValidators = [
  body('company_id').isUUID(),
  body('hazard_id').isUUID(),
  body('control_ids').isArray({ min: 1 }),
  body('control_ids.*').isUUID(),
];

export const sifHecaValidators = [
  body('company_id').isUUID(),
  body('hazard_id').isUUID(),
  body('high_energy_count').optional().isInt({ min: 0 }),
  body('open_capa_count').optional().isInt({ min: 0 }),
  body('prior_incident_count').optional().isInt({ min: 0 }),
];

export const idParamValidators = [param('id').isUUID()];
