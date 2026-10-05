import type { CoreDailyLogShift } from '@prisma/client';

/**
 * Serializable {@link CoreDailyLog} row returned by REST handlers (without joined relations).
 */
export interface CoreDailyLogEntity {
  id: number;
  title: string;
  body: string | null;
  logDate: Date;
  shift: CoreDailyLogShift;
  companyId: number | null;
  siteId: number | null;
  createdByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Response from GET /api/v1/core-daily-logs/summary */
export interface CoreDailyLogSummary {
  total: number;
  byShift: Record<CoreDailyLogShift, number>;
  filters: {
    companyId: number | null;
    siteId: number | null;
    logDateFrom: string | null;
    logDateTo: string | null;
  };
}

/**
 * @example POST /api/v1/core-daily-logs
 * ```json
 * {
 *   "activities": "Installed valves on Line 2. Crane pad inspected.",
 *   "safety_notes": "Spotter used for all lifts.",
 *   "date": "2026-05-08T06:00:00.000Z",
 *   "shift": "DAY",
 *   "company_id": 1,
 *   "site_id": 3,
 *   "supervisor": 4,
 *   "attachments": [12, 15]
 * }
 * ```
 */
export const CORE_DAILY_LOG_CREATE_EXAMPLE = {
  activities: 'Installed valves on Line 2. Crane pad inspected.',
  safety_notes: 'Spotter used for all lifts.',
  date: '2026-05-08T06:00:00.000Z',
  shift: 'DAY',
  company_id: 1,
  site_id: 3,
  supervisor: 4,
  attachments: [12, 15],
} as const;
