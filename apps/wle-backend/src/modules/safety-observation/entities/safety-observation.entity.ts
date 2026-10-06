import type {
  SafetyObservationSeverity,
  SafetyObservationStatus,
} from '@prisma/client';

/**
 * Serializable Safety Observation returned by REST handlers.
 */
export interface SafetyObservationEntity {
  id: number;
  title: string;
  description: string | null;
  severity: SafetyObservationSeverity;
  status: SafetyObservationStatus;
  observedAt: Date;
  locationNote: string | null;
  companyId: number | null;
  siteId: number | null;
  reportedByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
