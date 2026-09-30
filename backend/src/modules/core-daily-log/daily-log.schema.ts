/**
 * Daily Log schema (CoreDailyLog-backed).
 *
 * Persistence mapping:
 *   log_id        → CoreDailyLog.id
 *   site_id       → CoreDailyLog.siteId
 *   company_id    → CoreDailyLog.companyId
 *   supervisor    → CoreDailyLog.supervisorUserId (+ User join)
 *   date          → CoreDailyLog.logDate
 *   activities    → CoreDailyLog.activities (fallback: body)
 *   safety_notes  → CoreDailyLog.safetyNotes
 *   attachments   → CoreDailyLogAttachment[] → CoreFile
 */

export type DailyLogSupervisor = {
  id: number;
  email?: string | null;
  username?: string | null;
};

export type DailyLogAttachment = {
  file_id: number;
  file_name: string;
  file_type: string;
  public_url: string | null;
  purpose: string | null;
};

/** Canonical Daily Log record shape (API contract). */
export type DailyLogRecord = {
  log_id: number;
  site_id: number | null;
  company_id: number | null;
  supervisor: DailyLogSupervisor | null;
  date: string;
  activities: string | null;
  safety_notes: string | null;
  attachments: DailyLogAttachment[];
};

export function toDailyLogRecord(row: {
  id: number;
  siteId: number | null;
  companyId: number | null;
  logDate: Date | string;
  activities?: string | null;
  body?: string | null;
  safetyNotes?: string | null;
  supervisor?: {
    id: number;
    email?: string | null;
    username?: string | null;
  } | null;
  supervisorUserId?: number | null;
  attachments?: Array<{
    coreFile: {
      id: number;
      originalName: string;
      mimeType: string;
      publicUrl: string | null;
      purpose: string | null;
    };
  }>;
}): DailyLogRecord {
  const date =
    typeof row.logDate === 'string' ? row.logDate : row.logDate.toISOString();
  return {
    log_id: row.id,
    site_id: row.siteId,
    company_id: row.companyId,
    supervisor: row.supervisor
      ? {
          id: row.supervisor.id,
          email: row.supervisor.email ?? null,
          username: row.supervisor.username ?? null,
        }
      : row.supervisorUserId != null
        ? { id: row.supervisorUserId, email: null, username: null }
        : null,
    date,
    activities: row.activities ?? row.body ?? null,
    safety_notes: row.safetyNotes ?? null,
    attachments: (row.attachments ?? []).map((a) => ({
      file_id: a.coreFile.id,
      file_name: a.coreFile.originalName,
      file_type: a.coreFile.mimeType,
      public_url: a.coreFile.publicUrl,
      purpose: a.coreFile.purpose,
    })),
  };
}
