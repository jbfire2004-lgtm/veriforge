/**
 * Daily Log schema (CoreDailyLog-backed).
 *
 * Persistence mapping:
 *   log_id        → CoreDailyLog.id
 *   site_id       → CoreDailyLog.siteId
 *   company_id    → CoreDailyLog.companyId
 *   supervisor    → CoreDailyLog.supervisorUserId (+ User)
 *   date          → CoreDailyLog.logDate
 *   activities    → CoreDailyLog.activities
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
