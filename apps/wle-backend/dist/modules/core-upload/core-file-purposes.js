"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORE_FILE_PURPOSE_LABELS = exports.CORE_FILE_PURPOSES = void 0;
exports.normalizeCoreFilePurpose = normalizeCoreFilePurpose;
exports.CORE_FILE_PURPOSES = [
    'document_storage',
    'training_ingestion',
    'safety_program_ingestion',
    'completed_document',
    'inspection_signature',
    'orientation_media',
    'generic',
];
exports.CORE_FILE_PURPOSE_LABELS = {
    document_storage: 'Document storage',
    training_ingestion: 'Training ingestion',
    safety_program_ingestion: 'Safety program ingestion',
    completed_document: 'Completed document',
    inspection_signature: 'Inspection signature',
    orientation_media: 'Orientation media',
    generic: 'General',
};
function normalizeCoreFilePurpose(value) {
    const trimmed = value === null || value === void 0 ? void 0 : value.trim();
    if (!trimmed)
        return null;
    if (trimmed === 'training-ingest' || trimmed === 'training-ingestion') {
        return 'training_ingestion';
    }
    if (trimmed === 'safety-program-ingest' ||
        trimmed === 'safety-program-ingestion') {
        return 'safety_program_ingestion';
    }
    return trimmed.slice(0, 200);
}
//# sourceMappingURL=core-file-purposes.js.map