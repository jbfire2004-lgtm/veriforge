export type InspectionSharingConfig = {
    shareReportWithContractors: boolean;
    shareReportWithWorkers: boolean;
};
export declare const DEFAULT_INSPECTION_SHARING: InspectionSharingConfig;
export declare function parseInspectionSharing(raw: unknown): InspectionSharingConfig;
