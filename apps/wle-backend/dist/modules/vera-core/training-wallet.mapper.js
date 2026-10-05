"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAINING_RECORD_WALLET_INCLUDE = void 0;
exports.mapTrainingRecordForWallet = mapTrainingRecordForWallet;
const client_1 = require("@prisma/client");
const public_base_url_1 = require("../../config/public-base-url");
function mapTrainingRecordForWallet(record, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const now = new Date();
    const expired = Boolean(record.expiresAt && record.expiresAt < now);
    let complianceStatus = 'ACTIVE';
    if (options === null || options === void 0 ? void 0 : options.validationOutcome) {
        complianceStatus = options.validationOutcome;
    }
    else if (expired) {
        complianceStatus = client_1.TrainingValidationOutcome.REJECTED;
    }
    else if (!record.completedAt) {
        complianceStatus = client_1.TrainingValidationOutcome.NEEDS_REVIEW;
    }
    const jurisdictionCode = (_e = (_a = options === null || options === void 0 ? void 0 : options.jurisdictionCode) !== null && _a !== void 0 ? _a : (_d = (_c = (_b = record.project) === null || _b === void 0 ? void 0 : _b.site) === null || _c === void 0 ? void 0 : _c.region) === null || _d === void 0 ? void 0 : _d.trim().toUpperCase()) !== null && _e !== void 0 ? _e : null;
    const jurisdictionValid = (options === null || options === void 0 ? void 0 : options.validationOutcome) != null
        ? options.validationOutcome === client_1.TrainingValidationOutcome.APPROVED
        : expired
            ? false
            : true;
    const base = (_f = options === null || options === void 0 ? void 0 : options.baseUrl) !== null && _f !== void 0 ? _f : (0, public_base_url_1.resolvePublicBaseUrl)();
    const qrUrl = record.certificateQrToken
        ? `${base}/verify/certificate/${record.certificateQrToken}`
        : null;
    return {
        id: record.id,
        issuedAt: record.issuedAt,
        expiresAt: record.expiresAt,
        completedAt: record.completedAt,
        certification: record.certification
            ? {
                id: record.certification.id,
                name: record.certification.name,
                code: record.certification.code,
            }
            : null,
        providerName: (_h = (_g = record.trainingProvider) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : null,
        instructorName: record.instructor
            ? `${record.instructor.firstName} ${record.instructor.lastName}`.trim()
            : null,
        courseName: (_m = (_k = (_j = record.course) === null || _j === void 0 ? void 0 : _j.name) !== null && _k !== void 0 ? _k : (_l = record.certification) === null || _l === void 0 ? void 0 : _l.name) !== null && _m !== void 0 ? _m : null,
        courseCode: (_p = (_o = record.course) === null || _o === void 0 ? void 0 : _o.code) !== null && _p !== void 0 ? _p : null,
        courseStandards: (_s = (_r = (_q = record.course) === null || _q === void 0 ? void 0 : _q.standards) === null || _r === void 0 ? void 0 : _r.map((s) => s.standardKey)) !== null && _s !== void 0 ? _s : [],
        jurisdictionCode,
        jurisdictionValid,
        certificateQrToken: record.certificateQrToken,
        certificateQrUrl: qrUrl,
        certificateNumber: record.certificateNumber,
        complianceStatus,
        companyId: record.companyId,
        projectId: record.projectId,
        projectName: (_u = (_t = record.project) === null || _t === void 0 ? void 0 : _t.name) !== null && _u !== void 0 ? _u : null,
        companyName: (_w = (_v = record.company) === null || _v === void 0 ? void 0 : _v.name) !== null && _w !== void 0 ? _w : null,
        verifiedByVeraStatus: options === null || options === void 0 ? void 0 : options.verifiedByVeraStatus,
        jurisdictionCoverage: options === null || options === void 0 ? void 0 : options.jurisdictionCoverage,
        regulatorySummary: options === null || options === void 0 ? void 0 : options.regulatorySummary,
        nftTokenId: options === null || options === void 0 ? void 0 : options.nftTokenId,
        nftChain: options === null || options === void 0 ? void 0 : options.nftChain,
    };
}
exports.TRAINING_RECORD_WALLET_INCLUDE = {
    certification: true,
    trainingProvider: true,
    instructor: true,
    course: { include: { standards: true } },
    company: true,
    project: { include: { site: true } },
};
//# sourceMappingURL=training-wallet.mapper.js.map