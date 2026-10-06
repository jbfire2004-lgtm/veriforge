import type { InspectionScoreResult } from './inspection-scoring.engine';

export const INSPECTION_COMPLETED_AUDIT_EVENT = 'inspection_completed';

export const INSPECTION_PHOTO_CAPTURED_AUDIT_EVENT = 'photo.capture.analyzed';

export type InspectionCompletedScorePayload = Pick<
  InspectionScoreResult,
  'scorePercent' | 'passed' | 'riskScore' | 'requiresSupervisorReview'
> & {
  failedItemCount: number;
};

export type InspectionCompletedFindingPayload = {
  kind: 'deficiency' | 'photo_finding';
  id: string;
  title: string;
  severity: string;
  itemId?: string;
  category?: string;
};

export type InspectionCompletedSignaturePayload = {
  role: string;
  signerName?: string | null;
  signedAt: string;
  coreFileId?: number | null;
};

export type InspectionCompletedCriticalFlag = {
  itemId: string;
  label: string;
  failed: true;
};

export type InspectionCompletedFindingsSummary = {
  deficiencyCount: number;
  photoFindingCount: number;
  criticalDeficiencyCount: number;
  criticalFailedItemCount: number;
};

export type InspectionCompletedEventData = {
  inspectionId: string;
  score: InspectionCompletedScorePayload;
  findings: InspectionCompletedFindingPayload[];
  signatures: InspectionCompletedSignaturePayload[];
  signaturesPresent: boolean;
  findingsSummary: InspectionCompletedFindingsSummary;
  criticalFlags: InspectionCompletedCriticalFlag[];
};
