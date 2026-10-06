/**
 * Serializable Core Action Item shape returned by REST handlers.
 * Mirrors Prisma `CoreActionItem` plus optional joined fields.
 */
export interface CoreActionItemEntity {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueAt: Date | null;
  priority: string;
  companyId: number | null;
  createdById: number | null;
  coreMeetingRecordId: number | null;
  coreDailyLogId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
