"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValidateTrainingRecordQuery = parseValidateTrainingRecordQuery;
const common_1 = require("@nestjs/common");
function parseValidateTrainingRecordQuery(q) {
    const out = {};
    if (q.expectedWorkerId != null && q.expectedWorkerId !== '') {
        if (!/^\d+$/.test(q.expectedWorkerId)) {
            throw new common_1.BadRequestException('expectedWorkerId must be a positive integer');
        }
        const n = Number(q.expectedWorkerId);
        if (!Number.isSafeInteger(n) || n < 1) {
            throw new common_1.BadRequestException('expectedWorkerId must be a positive integer');
        }
        out.expectedWorkerId = n;
    }
    if (q.expectedCompanyId != null && q.expectedCompanyId !== '') {
        if (!/^\d+$/.test(q.expectedCompanyId)) {
            throw new common_1.BadRequestException('expectedCompanyId must be a positive integer');
        }
        const n = Number(q.expectedCompanyId);
        if (!Number.isSafeInteger(n) || n < 1) {
            throw new common_1.BadRequestException('expectedCompanyId must be a positive integer');
        }
        out.expectedCompanyId = n;
    }
    if (q.expectedTrainingType != null && q.expectedTrainingType !== '') {
        out.expectedTrainingType = q.expectedTrainingType;
    }
    if (q.expectedCertificateNumber != null &&
        q.expectedCertificateNumber !== '') {
        out.expectedCertificateNumber = q.expectedCertificateNumber;
    }
    if (q.expectedProvider != null && q.expectedProvider !== '') {
        out.expectedProvider = q.expectedProvider;
    }
    return out;
}
//# sourceMappingURL=parse-validate-training-record-query.js.map