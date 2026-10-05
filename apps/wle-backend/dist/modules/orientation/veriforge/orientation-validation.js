"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORIENTATION_NEAR_EXPIRY_DAYS = exports.ORIENTATION_UPLOAD_ALLOWED_MIME = exports.ORIENTATION_UPLOAD_MAX_BYTES = exports.ORIENTATION_BLOCK_TYPES = void 0;
exports.bumpMinorVersion = bumpMinorVersion;
exports.computeExpiresOn = computeExpiresOn;
exports.isNearExpiry = isNearExpiry;
exports.normalizeAndValidateBlocks = normalizeAndValidateBlocks;
exports.assertOrientationUploadFile = assertOrientationUploadFile;
exports.buildSecureOrientationObjectKey = buildSecureOrientationObjectKey;
const common_1 = require("@nestjs/common");
exports.ORIENTATION_BLOCK_TYPES = [
    'slide',
    'text',
    'video',
    'quiz',
    'policy_ack',
];
exports.ORIENTATION_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
exports.ORIENTATION_UPLOAD_ALLOWED_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
]);
exports.ORIENTATION_NEAR_EXPIRY_DAYS = 30;
function bumpMinorVersion(version) {
    const [majorRaw, minorRaw] = version.split('.');
    const major = Number(majorRaw) || 1;
    const minor = Number(minorRaw) || 0;
    return `${major}.${minor + 1}`;
}
function computeExpiresOn(completedOn, rules) {
    const days = rules === null || rules === void 0 ? void 0 : rules.durationDays;
    if (days == null || days <= 0)
        return null;
    const expires = new Date(completedOn);
    expires.setUTCDate(expires.getUTCDate() + days);
    return expires;
}
function isNearExpiry(expiresOn, now = new Date(), withinDays = exports.ORIENTATION_NEAR_EXPIRY_DAYS) {
    if (!expiresOn)
        return false;
    const ms = expiresOn.getTime() - now.getTime();
    if (ms < 0)
        return false;
    return ms <= withinDays * 24 * 60 * 60 * 1000;
}
function normalizeAndValidateBlocks(blocks) {
    if (blocks == null)
        return [];
    if (!Array.isArray(blocks)) {
        throw new common_1.BadRequestException('contentBlocks must be an array');
    }
    if (blocks.length > 200) {
        throw new common_1.BadRequestException('contentBlocks exceeds maximum of 200');
    }
    return blocks.map((raw, i) => {
        var _a, _b;
        if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
            throw new common_1.BadRequestException(`contentBlocks[${i}] must be an object`);
        }
        const b = raw;
        const type = String((_a = b.type) !== null && _a !== void 0 ? _a : '');
        if (!exports.ORIENTATION_BLOCK_TYPES.includes(type)) {
            throw new common_1.BadRequestException(`contentBlocks[${i}].type must be one of: ${exports.ORIENTATION_BLOCK_TYPES.join(', ')}`);
        }
        let quiz;
        if (type === 'quiz') {
            const q = b.quiz;
            if (q == null || typeof q !== 'object' || Array.isArray(q)) {
                throw new common_1.BadRequestException(`contentBlocks[${i}].quiz is required for quiz blocks`);
            }
            const quizObj = q;
            const prompt = String((_b = quizObj.prompt) !== null && _b !== void 0 ? _b : '').trim();
            const choices = quizObj.choices;
            if (!prompt) {
                throw new common_1.BadRequestException(`contentBlocks[${i}].quiz.prompt is required`);
            }
            if (!Array.isArray(choices) || choices.length < 2) {
                throw new common_1.BadRequestException(`contentBlocks[${i}].quiz.choices must have at least 2 items`);
            }
            const answerIndex = Number(quizObj.answerIndex);
            if (!Number.isInteger(answerIndex) ||
                answerIndex < 0 ||
                answerIndex >= choices.length) {
                throw new common_1.BadRequestException(`contentBlocks[${i}].quiz.answerIndex is out of range`);
            }
            quiz = {
                prompt,
                choices: choices.map((c) => String(c)),
                answerIndex,
            };
        }
        return {
            id: String(b.id || `block-${i + 1}`),
            type: type,
            title: b.title != null ? String(b.title) : undefined,
            body: b.body != null ? String(b.body) : undefined,
            mediaUrl: b.mediaUrl != null ? String(b.mediaUrl) : undefined,
            quiz,
            policyId: b.policyId != null ? String(b.policyId) : undefined,
            order: typeof b.order === 'number' ? b.order : i,
            meta: b.meta != null && typeof b.meta === 'object' && !Array.isArray(b.meta)
                ? b.meta
                : undefined,
        };
    });
}
function assertOrientationUploadFile(file) {
    var _a;
    if (!file) {
        throw new common_1.BadRequestException('file is required');
    }
    const size = (_a = file.size) !== null && _a !== void 0 ? _a : 0;
    if (size <= 0) {
        throw new common_1.BadRequestException('file is empty');
    }
    if (size > exports.ORIENTATION_UPLOAD_MAX_BYTES) {
        throw new common_1.BadRequestException(`file exceeds maximum size of ${exports.ORIENTATION_UPLOAD_MAX_BYTES} bytes`);
    }
    const mime = (file.mimetype || '').toLowerCase();
    if (!exports.ORIENTATION_UPLOAD_ALLOWED_MIME.has(mime)) {
        throw new common_1.BadRequestException(`unsupported file type: ${mime || 'unknown'}`);
    }
}
function buildSecureOrientationObjectKey(input) {
    var _a;
    const safeName = (input.originalName || 'upload.bin')
        .replace(/[/\\]/g, '_')
        .replace(/\.\./g, '_')
        .replace(/[^\w.\-]+/g, '_')
        .slice(0, 120);
    const stamp = ((_a = input.now) !== null && _a !== void 0 ? _a : new Date()).toISOString().replace(/[:.]/g, '-');
    return `orientation/${input.companyId}/${stamp}-${safeName}`;
}
//# sourceMappingURL=orientation-validation.js.map