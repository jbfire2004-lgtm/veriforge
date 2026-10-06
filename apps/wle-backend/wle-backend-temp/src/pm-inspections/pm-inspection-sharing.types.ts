export type InspectionSharingConfig = {
  shareReportWithContractors: boolean;
  shareReportWithWorkers: boolean;
};

export const DEFAULT_INSPECTION_SHARING: InspectionSharingConfig = {
  shareReportWithContractors: false,
  shareReportWithWorkers: false,
};

export function parseInspectionSharing(raw: unknown): InspectionSharingConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_INSPECTION_SHARING };
  const row = raw as Partial<InspectionSharingConfig>;
  return {
    shareReportWithContractors: Boolean(row.shareReportWithContractors),
    shareReportWithWorkers: Boolean(row.shareReportWithWorkers),
  };
}
