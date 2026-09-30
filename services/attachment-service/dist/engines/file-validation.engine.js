"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileValidationEngine = exports.FileValidationEngine = void 0;
const env_1 = require("../config/env");
const ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
]);
const BLOCKED_MIME = new Set([
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/vnd.microsoft.portable-executable',
    'application/x-sh',
    'application/javascript',
    'text/html',
]);
const BLOCKED_EXT = new Set(['exe', 'bat', 'cmd', 'sh', 'js', 'msi', 'dll', 'scr']);
class FileValidationEngine {
    validate(input) {
        const errors = [];
        const mime = input.mimeType.toLowerCase();
        const ext = input.fileName.split('.').pop()?.toLowerCase() ?? '';
        if (BLOCKED_MIME.has(mime)) {
            errors.push(`File type not allowed: ${mime}`);
        }
        if (BLOCKED_EXT.has(ext)) {
            errors.push(`File extension not allowed: .${ext}`);
        }
        if (!ALLOWED_MIME.has(mime) && !mime.startsWith('image/')) {
            errors.push(`MIME type not allowed: ${mime}`);
        }
        const max = input.maxBytes ?? env_1.env.maxFileSizeBytes;
        if (input.fileSize > max) {
            errors.push(`File exceeds ${Math.round(max / 1024 / 1024)}MB limit`);
        }
        return { ok: errors.length === 0, errors };
    }
    isImageMime(mimeType) {
        return mimeType.toLowerCase().startsWith('image/');
    }
}
exports.FileValidationEngine = FileValidationEngine;
exports.fileValidationEngine = new FileValidationEngine();
//# sourceMappingURL=file-validation.engine.js.map