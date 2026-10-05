"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIT_TEST_DEFAULT_VALIDITY_YEARS = void 0;
exports.resolveFitTestValidityYears = resolveFitTestValidityYears;
exports.computeFitTestExpiresAt = computeFitTestExpiresAt;
exports.evaluateFitTest = evaluateFitTest;
exports.fitTestReadinessScore = fitTestReadinessScore;
exports.FIT_TEST_DEFAULT_VALIDITY_YEARS = 1;
function resolveFitTestValidityYears(input) {
    if (input == null || !Number.isFinite(input) || input <= 0) {
        return exports.FIT_TEST_DEFAULT_VALIDITY_YEARS;
    }
    return input;
}
function computeFitTestExpiresAt(performedAt, validityYears = exports.FIT_TEST_DEFAULT_VALIDITY_YEARS) {
    const expiresAt = new Date(performedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + validityYears);
    return expiresAt;
}
function evaluateFitTest(input) {
    var _a;
    const pass = input.result === 'PASS';
    const conditional = input.result === 'CONDITIONAL';
    const validityYears = resolveFitTestValidityYears(input.validityYears);
    let expiresAt = (_a = input.expiresAt) !== null && _a !== void 0 ? _a : null;
    if (pass && !expiresAt) {
        expiresAt = computeFitTestExpiresAt(input.performedAt, validityYears);
    }
    const now = new Date();
    const expired = Boolean(expiresAt && expiresAt < now && pass);
    const daysUntilExpiry = expiresAt != null
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        : null;
    const expiringSoon = daysUntilExpiry != null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 30 &&
        pass &&
        !expired;
    let statusLabel;
    if (conditional)
        statusLabel = 'CONDITIONAL';
    else if (expired)
        statusLabel = 'EXPIRED';
    else if (pass)
        statusLabel = 'PASS';
    else
        statusLabel = 'FAIL';
    return {
        pass: pass && !expired,
        statusLabel,
        expiresAt,
        daysUntilExpiry,
        expired,
        expiringSoon,
    };
}
function fitTestReadinessScore(input) {
    if (!input.hasRun || !input.evaluation)
        return 0;
    if (input.evaluation.pass)
        return 100;
    if (input.evaluation.expired)
        return 20;
    if (input.evaluation.statusLabel === 'CONDITIONAL')
        return 50;
    return 0;
}
//# sourceMappingURL=fit-test.engine.js.map