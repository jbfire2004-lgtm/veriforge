"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONSUMER_RETRY = exports.DEFAULT_PUBLISH_RETRY = void 0;
exports.nextRetryAt = nextRetryAt;
exports.DEFAULT_PUBLISH_RETRY = {
    maxAttempts: 5,
    baseDelayMs: 2000,
    maxDelayMs: 120000,
    jitterRatio: 0.15,
};
exports.DEFAULT_CONSUMER_RETRY = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 60000,
    jitterRatio: 0.1,
};
function nextRetryAt(attempts, policy = exports.DEFAULT_PUBLISH_RETRY, now = Date.now()) {
    const exp = Math.min(policy.maxDelayMs, policy.baseDelayMs * Math.pow(2, Math.max(0, attempts - 1)));
    const jitter = exp * policy.jitterRatio * (Math.random() * 2 - 1);
    return new Date(now + Math.max(policy.baseDelayMs, exp + jitter));
}
//# sourceMappingURL=event-retry.policy.js.map