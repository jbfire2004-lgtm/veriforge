"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CERTIFICATE_NUMBER_PATTERN_SHORT = exports.CERTIFICATE_NUMBER_PATTERN = exports.TRAINING_RECORD_EXPIRING_SOON_DAYS = void 0;
exports.checkExpiry = checkExpiry;
exports.checkProvider = checkProvider;
exports.checkExpectedProvider = checkExpectedProvider;
exports.checkExpectedCompany = checkExpectedCompany;
exports.checkCredentialCoverage = checkCredentialCoverage;
exports.checkCompletionState = checkCompletionState;
exports.checkWorkerIdentity = checkWorkerIdentity;
exports.checkTrainingType = checkTrainingType;
exports.checkCertificateNumber = checkCertificateNumber;
exports.aggregateTrainingRecordOverallStatus = aggregateTrainingRecordOverallStatus;
exports.buildTrainingRecordVerificationSummary = buildTrainingRecordVerificationSummary;
exports.TRAINING_RECORD_EXPIRING_SOON_DAYS = 30;
function checkExpiry(tr) {
    var _a, _b;
    const now = new Date();
    const issuedAtIso = tr.issuedAt.toISOString();
    if (tr.issuedAt.getTime() > now.getTime()) {
        return {
            check: 'expiry',
            status: 'WARN',
            issuedAt: issuedAtIso,
            expiresAt: (_b = (_a = tr.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
            daysUntilExpiry: null,
            message: 'issuedAt is in the future — verify source data',
        };
    }
    if (tr.expiresAt == null) {
        return {
            check: 'expiry',
            status: 'WARN',
            issuedAt: issuedAtIso,
            expiresAt: null,
            daysUntilExpiry: null,
            message: 'No expiry date on record (open-ended certification)',
        };
    }
    const exp = tr.expiresAt;
    const expIso = exp.toISOString();
    const diffMs = exp.getTime() - now.getTime();
    const daysUntilExpiry = Math.floor(diffMs / 86400000);
    if (diffMs < 0) {
        return {
            check: 'expiry',
            status: 'FAIL',
            issuedAt: issuedAtIso,
            expiresAt: expIso,
            daysUntilExpiry,
            message: 'Training is expired',
        };
    }
    if (daysUntilExpiry <= exports.TRAINING_RECORD_EXPIRING_SOON_DAYS) {
        return {
            check: 'expiry',
            status: 'WARN',
            issuedAt: issuedAtIso,
            expiresAt: expIso,
            daysUntilExpiry,
            message: `Expires within ${exports.TRAINING_RECORD_EXPIRING_SOON_DAYS} days`,
        };
    }
    return {
        check: 'expiry',
        status: 'PASS',
        issuedAt: issuedAtIso,
        expiresAt: expIso,
        daysUntilExpiry,
        message: 'Expiry date is valid',
    };
}
function checkProvider(tr) {
    if (tr.providerId == null) {
        return {
            check: 'provider',
            status: 'WARN',
            providerId: null,
            providerName: null,
            message: 'No training provider on file',
        };
    }
    if (!tr.provider) {
        return {
            check: 'provider',
            status: 'FAIL',
            providerId: tr.providerId,
            providerName: null,
            message: 'Provider id is set but provider record is missing',
        };
    }
    return {
        check: 'provider',
        status: 'PASS',
        providerId: tr.provider.id,
        providerName: tr.provider.name,
        message: 'Provider is registered',
    };
}
function normalizeProviderLabel(s) {
    return s.trim().replace(/\s+/g, ' ').toLowerCase();
}
function checkExpectedProvider(tr, options) {
    var _a, _b, _c, _d, _e;
    const recordId = (_c = (_b = (_a = tr.provider) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : tr.providerId) !== null && _c !== void 0 ? _c : null;
    const recordName = (_e = (_d = tr.provider) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : null;
    const raw = options === null || options === void 0 ? void 0 : options.expectedProvider;
    const expected = raw == null || raw.trim() === '' ? null : normalizeProviderLabel(raw);
    if (expected == null) {
        return {
            check: 'expectedProvider',
            status: 'PASS',
            recordProviderId: recordId,
            recordProviderName: recordName,
            expectedProviderName: null,
            message: recordName
                ? `Expected provider not supplied; on file: ${recordName}`
                : 'Expected provider not supplied; no issuer name to compare',
        };
    }
    if (tr.providerId == null || !tr.provider) {
        return {
            check: 'expectedProvider',
            status: 'FAIL',
            recordProviderId: recordId,
            recordProviderName: recordName,
            expectedProviderName: raw.trim(),
            message: 'Cannot match expected provider — no training provider linked to this record',
        };
    }
    const onFile = normalizeProviderLabel(tr.provider.name);
    if (onFile !== expected) {
        return {
            check: 'expectedProvider',
            status: 'FAIL',
            recordProviderId: tr.provider.id,
            recordProviderName: tr.provider.name,
            expectedProviderName: raw.trim(),
            message: `Expected issuer "${raw.trim()}" does not match provider on file`,
        };
    }
    return {
        check: 'expectedProvider',
        status: 'PASS',
        recordProviderId: tr.provider.id,
        recordProviderName: tr.provider.name,
        expectedProviderName: raw.trim(),
        message: 'Expected provider matches linked training provider',
    };
}
function checkExpectedCompany(tr, options) {
    const recordId = tr.worker.companyId;
    const expected = options === null || options === void 0 ? void 0 : options.expectedCompanyId;
    if (expected == null) {
        return {
            check: 'expectedCompany',
            status: 'PASS',
            recordCompanyId: recordId,
            expectedCompanyId: null,
            message: recordId != null
                ? `Worker company id ${recordId} (no expectedCompanyId query to enforce)`
                : 'Worker has no company; expectedCompanyId not supplied',
        };
    }
    if (recordId == null) {
        return {
            check: 'expectedCompany',
            status: 'FAIL',
            recordCompanyId: null,
            expectedCompanyId: expected,
            message: 'Worker has no company assignment; cannot match expectedCompanyId',
        };
    }
    if (recordId !== expected) {
        return {
            check: 'expectedCompany',
            status: 'FAIL',
            recordCompanyId: recordId,
            expectedCompanyId: expected,
            message: `Worker belongs to company ${recordId} but expected ${expected}`,
        };
    }
    return {
        check: 'expectedCompany',
        status: 'PASS',
        recordCompanyId: recordId,
        expectedCompanyId: expected,
        message: 'Worker company matches expectedCompanyId',
    };
}
function checkCredentialCoverage(credentials, certificationId, certificationName) {
    const now = new Date();
    const nameNorm = certificationName.trim().toLowerCase();
    const relevant = credentials.filter((c) => {
        var _a;
        if (c.certificationId === certificationId)
            return true;
        if (((_a = c.certification) === null || _a === void 0 ? void 0 : _a.id) === certificationId)
            return true;
        if (c.certificationId == null && c.certification == null) {
            return c.name.trim().toLowerCase() === nameNorm;
        }
        return false;
    });
    if (relevant.length === 0) {
        return {
            check: 'credentialCoverage',
            status: 'WARN',
            matchingCredentialCount: 0,
            validCredentialCount: 0,
            message: 'No digitized credential linked to this certification for the worker',
        };
    }
    const valid = relevant.filter((c) => !c.expiresAt || c.expiresAt.getTime() > now.getTime());
    if (valid.length === 0) {
        return {
            check: 'credentialCoverage',
            status: 'FAIL',
            matchingCredentialCount: relevant.length,
            validCredentialCount: 0,
            message: 'Digitized credential(s) for this certification are expired',
        };
    }
    return {
        check: 'credentialCoverage',
        status: 'PASS',
        matchingCredentialCount: relevant.length,
        validCredentialCount: valid.length,
        message: `Found ${valid.length} non-expired credential row(s) for this certification`,
    };
}
function checkCompletionState(tr) {
    if (tr.completedAt != null) {
        return {
            check: 'completionState',
            status: 'WARN',
            alreadyCompleted: true,
            completedAt: tr.completedAt.toISOString(),
            message: 'Training record was already marked complete (prior sign-off / attestation)',
        };
    }
    return {
        check: 'completionState',
        status: 'PASS',
        alreadyCompleted: false,
        completedAt: null,
        message: 'Training record is not yet marked complete',
    };
}
function checkWorkerIdentity(tr, options) {
    var _a, _b, _c, _d, _e, _f;
    const w = tr.worker;
    const name = `${w.firstName} ${w.lastName}`.trim();
    const expected = options === null || options === void 0 ? void 0 : options.expectedWorkerId;
    if (expected != null && expected !== w.id) {
        return {
            check: 'workerIdentity',
            status: 'FAIL',
            workerId: w.id,
            workerName: name,
            workerStatus: w.status,
            companyId: w.companyId,
            companyName: (_b = (_a = w.company) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
            expectedWorkerId: expected,
            message: `Record is for worker ${w.id} but expected ${expected}`,
        };
    }
    const active = typeof w.status === 'string' && w.status.toUpperCase() === 'ACTIVE';
    if (!active) {
        return {
            check: 'workerIdentity',
            status: 'FAIL',
            workerId: w.id,
            workerName: name,
            workerStatus: w.status,
            companyId: w.companyId,
            companyName: (_d = (_c = w.company) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : null,
            expectedWorkerId: expected !== null && expected !== void 0 ? expected : null,
            message: `Worker is not active (status=${w.status})`,
        };
    }
    if (w.companyId == null) {
        return {
            check: 'workerIdentity',
            status: 'WARN',
            workerId: w.id,
            workerName: name,
            workerStatus: w.status,
            companyId: null,
            companyName: null,
            expectedWorkerId: expected !== null && expected !== void 0 ? expected : null,
            message: 'Worker has no company assignment',
        };
    }
    return {
        check: 'workerIdentity',
        status: 'PASS',
        workerId: w.id,
        workerName: name,
        workerStatus: w.status,
        companyId: w.companyId,
        companyName: (_f = (_e = w.company) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : null,
        expectedWorkerId: expected !== null && expected !== void 0 ? expected : null,
        message: 'Worker identity matches active assignment',
    };
}
exports.CERTIFICATE_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s\-\/#.,]{1,126}[A-Za-z0-9]$/;
exports.CERTIFICATE_NUMBER_PATTERN_SHORT = /^[A-Za-z0-9]{1,2}$/;
function checkTrainingType(certification, options) {
    var _a;
    const recordName = certification.name;
    const recordCode = (_a = certification.code) !== null && _a !== void 0 ? _a : null;
    const raw = options === null || options === void 0 ? void 0 : options.expectedTrainingType;
    const expected = raw == null || raw.trim() === '' ? null : raw.trim().toLowerCase();
    if (expected == null) {
        return {
            check: 'trainingType',
            status: 'PASS',
            recordName,
            recordCode,
            expectedTrainingType: null,
            message: `Training type on record: ${recordName}${recordCode ? ` (${recordCode})` : ''}`,
        };
    }
    const nameMatch = recordName.trim().toLowerCase() === expected;
    const codeMatch = recordCode != null && recordCode.trim().toLowerCase() === expected;
    if (nameMatch || codeMatch) {
        return {
            check: 'trainingType',
            status: 'PASS',
            recordName,
            recordCode,
            expectedTrainingType: raw.trim(),
            message: 'Expected training type matches linked certification',
        };
    }
    return {
        check: 'trainingType',
        status: 'FAIL',
        recordName,
        recordCode,
        expectedTrainingType: raw.trim(),
        message: `Expected "${raw.trim()}" does not match certification name or code`,
    };
}
function checkCertificateNumber(tr, options) {
    const storedRaw = tr.certificateNumber;
    const stored = storedRaw == null || storedRaw.trim() === '' ? null : storedRaw.trim();
    const expRaw = options === null || options === void 0 ? void 0 : options.expectedCertificateNumber;
    const expected = expRaw == null || expRaw.trim() === '' ? null : expRaw.trim();
    const formatOk = (value) => {
        if (value.length < 1 || value.length > 128)
            return false;
        if (exports.CERTIFICATE_NUMBER_PATTERN_SHORT.test(value) ||
            exports.CERTIFICATE_NUMBER_PATTERN.test(value)) {
            return true;
        }
        return false;
    };
    if (stored == null) {
        if (expected != null) {
            return {
                check: 'certificateNumber',
                status: 'FAIL',
                hasCertificateNumber: false,
                expectedCertificateNumber: expected,
                message: 'No certificate number on record; cannot match expected value',
            };
        }
        return {
            check: 'certificateNumber',
            status: 'WARN',
            hasCertificateNumber: false,
            expectedCertificateNumber: null,
            message: 'No certificate number stored for this record',
        };
    }
    if (!formatOk(stored)) {
        return {
            check: 'certificateNumber',
            status: 'FAIL',
            hasCertificateNumber: true,
            expectedCertificateNumber: expected,
            message: 'Certificate number format is invalid',
        };
    }
    if (expected != null && stored !== expected) {
        return {
            check: 'certificateNumber',
            status: 'FAIL',
            hasCertificateNumber: true,
            expectedCertificateNumber: expected,
            message: 'Certificate number does not match expected value',
        };
    }
    if (expected != null) {
        return {
            check: 'certificateNumber',
            status: 'PASS',
            hasCertificateNumber: true,
            expectedCertificateNumber: expected,
            message: 'Certificate number matches expected value',
        };
    }
    return {
        check: 'certificateNumber',
        status: 'PASS',
        hasCertificateNumber: true,
        expectedCertificateNumber: null,
        message: 'Certificate number is present and well-formed',
    };
}
function aggregateTrainingRecordOverallStatus(checks) {
    const list = [
        checks.expiry,
        checks.provider,
        checks.expectedProvider,
        checks.workerIdentity,
        checks.expectedCompany,
        checks.trainingType,
        checks.certificateNumber,
        checks.credentialCoverage,
        checks.completionState,
    ];
    if (list.some((c) => c.status === 'FAIL')) {
        return 'INVALID';
    }
    if (list.some((c) => c.status === 'WARN')) {
        return 'ATTENTION';
    }
    return 'VERIFIED';
}
function buildTrainingRecordVerificationSummary(checks) {
    const summary = [];
    const append = (status, msg) => {
        const prefix = status === 'FAIL' ? '✗' : status === 'WARN' ? '!' : '✓';
        summary.push(`${prefix} ${msg}`);
    };
    append(checks.expiry.status, checks.expiry.message);
    append(checks.provider.status, checks.provider.message);
    append(checks.expectedProvider.status, checks.expectedProvider.message);
    append(checks.workerIdentity.status, checks.workerIdentity.message);
    append(checks.expectedCompany.status, checks.expectedCompany.message);
    append(checks.trainingType.status, checks.trainingType.message);
    append(checks.certificateNumber.status, checks.certificateNumber.message);
    append(checks.credentialCoverage.status, checks.credentialCoverage.message);
    append(checks.completionState.status, checks.completionState.message);
    return summary;
}
//# sourceMappingURL=training-record-checks.js.map