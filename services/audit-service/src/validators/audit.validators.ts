import { body, param, query } from 'express-validator';

const MAX_EVENT_DATA_BYTES = 256 * 1024;

function isPlainObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const ingestEventValidators = [
  body('company_id').isUUID(),
  body('module').trim().isLength({ min: 1, max: 64 }),
  body('event_type').trim().isLength({ min: 1, max: 128 }),
  body('actor_id').isUUID(),
  body('event_data')
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

export const listEventsValidators = [
  query('company_id').optional().isUUID(),
  query('module').optional().trim().isLength({ min: 1, max: 64 }),
  query('actor_id').optional().isUUID(),
  query('event_type').optional().trim().isLength({ min: 1, max: 128 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('offset').optional().isInt({ min: 0 }),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];

export const getEventValidators = [param('id').isUUID()];
