"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAINING_INGEST_ALLOWED_MIMES = exports.TRAINING_INGEST_UPLOAD_MAX_BYTES = void 0;
exports.TRAINING_INGEST_UPLOAD_MAX_BYTES = 30 * 1024 * 1024;
exports.TRAINING_INGEST_ALLOWED_MIMES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/json',
]);
//# sourceMappingURL=training-ingestion-upload.config.js.map