"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INGESTION_REVIEW_THRESHOLD = exports.INGESTION_BLOCK_THRESHOLD = void 0;
exports.scoreIngestRow = scoreIngestRow;
exports.scoreBatch = scoreBatch;
exports.INGESTION_BLOCK_THRESHOLD = 0.35;
exports.INGESTION_REVIEW_THRESHOLD = 0.55;
const REQUIRED_FOR_AUTO = [
    'workerId',
    'issuedAt',
    'expiresAt',
];
function hasCertIdentity(row) {
    var _a, _b;
    return Boolean(row.certificationId ||
        ((_a = row.certificationCode) === null || _a === void 0 ? void 0 : _a.trim()) ||
        ((_b = row.certificationName) === null || _b === void 0 ? void 0 : _b.trim()));
}
function mergeFieldMaps(...maps) {
    var _a;
    const out = {};
    for (const m of maps) {
        if (!m)
            continue;
        for (const [k, v] of Object.entries(m)) {
            const key = k;
            if (typeof v === 'number') {
                out[key] = Math.max((_a = out[key]) !== null && _a !== void 0 ? _a : 0, v);
            }
        }
    }
    return out;
}
function scoreIngestRow(row, ocr) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const fields = mergeFieldMaps(ocr === null || ocr === void 0 ? void 0 : ocr.fieldConfidence, row.fieldConfidence);
    if (row.workerId)
        fields.workerId = Math.max((_a = fields.workerId) !== null && _a !== void 0 ? _a : 0, 0.9);
    if (row.issuedAt)
        fields.issuedAt = Math.max((_b = fields.issuedAt) !== null && _b !== void 0 ? _b : 0, 0.85);
    if (row.expiresAt)
        fields.expiresAt = Math.max((_c = fields.expiresAt) !== null && _c !== void 0 ? _c : 0, 0.85);
    if (hasCertIdentity(row)) {
        fields.certificationCode = Math.max((_e = (_d = fields.certificationCode) !== null && _d !== void 0 ? _d : fields.certificationName) !== null && _e !== void 0 ? _e : 0, 0.8);
    }
    if ((_f = row.providerName) === null || _f === void 0 ? void 0 : _f.trim()) {
        fields.providerName = Math.max((_g = fields.providerName) !== null && _g !== void 0 ? _g : 0, 0.7);
    }
    const values = Object.values(fields).filter((v) => typeof v === 'number');
    const overall = (_h = row.confidence) !== null && _h !== void 0 ? _h : (values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : (_j = ocr === null || ocr === void 0 ? void 0 : ocr.confidence) !== null && _j !== void 0 ? _j : 0);
    const reasons = [];
    if (!row.workerId)
        reasons.push('missing_worker');
    if (!row.issuedAt || !row.expiresAt)
        reasons.push('missing_dates');
    if (!hasCertIdentity(row))
        reasons.push('missing_certification');
    for (const key of REQUIRED_FOR_AUTO) {
        const score = fields[key];
        if (row[key] && (score !== null && score !== void 0 ? score : 0) < 0.4) {
            reasons.push(`low_confidence_${key}`);
        }
    }
    const blocked = overall < exports.INGESTION_BLOCK_THRESHOLD ||
        reasons.includes('missing_worker') ||
        reasons.includes('missing_dates') ||
        reasons.includes('missing_certification');
    const needsReview = !blocked &&
        (overall < exports.INGESTION_REVIEW_THRESHOLD ||
            reasons.some((r) => r.startsWith('low_confidence_')));
    return { overall, fields, blocked, needsReview, reasons };
}
function scoreBatch(rows, ocr) {
    if (rows.length === 0) {
        return {
            overall: 0,
            fields: {},
            blocked: true,
            needsReview: false,
            reasons: ['no_rows'],
        };
    }
    const reports = rows.map((r) => scoreIngestRow(r, ocr));
    const overall = reports.reduce((sum, r) => sum + r.overall, 0) / reports.length;
    return {
        overall,
        fields: mergeFieldMaps(...reports.map((r) => r.fields)),
        blocked: reports.some((r) => r.blocked),
        needsReview: reports.some((r) => r.needsReview),
        reasons: [...new Set(reports.flatMap((r) => r.reasons))],
    };
}
//# sourceMappingURL=confidence-scoring.js.map