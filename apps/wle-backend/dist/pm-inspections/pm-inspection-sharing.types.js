"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INSPECTION_SHARING = void 0;
exports.parseInspectionSharing = parseInspectionSharing;
exports.DEFAULT_INSPECTION_SHARING = {
    shareReportWithContractors: false,
    shareReportWithWorkers: false,
};
function parseInspectionSharing(raw) {
    if (!raw || typeof raw !== 'object')
        return Object.assign({}, exports.DEFAULT_INSPECTION_SHARING);
    const row = raw;
    return {
        shareReportWithContractors: Boolean(row.shareReportWithContractors),
        shareReportWithWorkers: Boolean(row.shareReportWithWorkers),
    };
}
//# sourceMappingURL=pm-inspection-sharing.types.js.map