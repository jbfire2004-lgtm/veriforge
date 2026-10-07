import type { CoreMeetingRecordType } from '@prisma/client';

/**
 * Response from GET /core-meeting-records/summary
 *
 * @example
 * ```json
 * {
 *   "total": 42,
 *   "byType": {
 *     "TEAM_SAFETY": 10,
 *     "TOOLBOX": 24,
 *     "MANAGEMENT_REVIEW": 6,
 *     "OTHER": 2
 *   },
 *   "filters": {
 *     "companyId": 1,
 *     "siteId": null,
 *     "heldFrom": "2026-01-01T00:00:00.000Z",
 *     "heldTo": "2026-12-31T23:59:59.999Z"
 *   }
 * }
 * ```
 */
export interface CoreMeetingRecordSummary {
  total: number;
  byType: Record<CoreMeetingRecordType, number>;
  filters: {
    companyId: number | null;
    siteId: number | null;
    heldFrom: string | null;
    heldTo: string | null;
  };
}

/**
 * Serializable meeting record returned by `GET/PATCH/POST` handlers.
 *
 * @example Create response shape (JSON)
 * ```json
 * {
 *   "id": 1,
 *   "title": "Toolbox — crane lifts",
 *   "body": "Discussed swing radius; spotters assigned.",
 *   "meetingType": "TOOLBOX",
 *   "heldAt": "2026-05-03T14:30:00.000Z",
 *   "companyId": 2,
 *   "siteId": 5,
 *   "recordedByUserId": 3,
 *   "createdAt": "2026-05-03T15:00:00.000Z",
 *   "updatedAt": "2026-05-03T15:00:00.000Z",
 *   "company": { "id": 2, "name": "Acme Industrial" },
 *   "site": { "id": 5, "name": "Yard B", "code": "YB" },
 *   "recordedBy": { "id": 3, "username": "jsupervisor" }
 * }
 * ```
 *
 * @example Create request body
 * ```json
 * {
 *   "title": "Monthly management safety review",
 *   "body": "Reviewed TRIR trends and CAPA backlog.",
 *   "meetingType": "MANAGEMENT_REVIEW",
 *   "heldAt": "2026-05-01T09:00:00.000Z",
 *   "companyId": 2,
 *   "siteId": null,
 *   "recordedByUserId": 1
 * }
 * ```
 */
/** Summary row for action items nested under GET /core-meeting-records/:id */
export interface CoreMeetingRecordLinkedActionItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt: Date | null;
}

export interface CoreMeetingRecordEntity {
  id: number;
  title: string;
  body: string | null;
  meetingType: CoreMeetingRecordType;
  heldAt: Date;
  companyId: number | null;
  siteId: number | null;
  recordedByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
  coreActionItems?: CoreMeetingRecordLinkedActionItem[];
}
