import type {
  CoreComplianceNoteCategory,
  CoreComplianceNotePriority,
  CoreComplianceNoteStatus,
} from '@prisma/client';

/**
 * Serializable row returned by REST handlers for {@link CoreComplianceNote}.
 */
export interface CoreComplianceNoteEntity {
  id: number;
  title: string;
  body: string | null;
  category: CoreComplianceNoteCategory;
  status: CoreComplianceNoteStatus;
  priority: CoreComplianceNotePriority;
  dueAt: Date | null;
  companyId: number | null;
  siteId: number | null;
  createdByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
