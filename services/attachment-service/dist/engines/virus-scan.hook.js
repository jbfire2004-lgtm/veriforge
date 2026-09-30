"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVirusScanHook = runVirusScanHook;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
async function runVirusScanHook(input) {
    if (!env_1.env.virusScanUrl) {
        return { clean: true };
    }
    try {
        const res = await fetch(env_1.env.virusScanUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
            signal: AbortSignal.timeout(env_1.env.virusScanTimeoutMs),
        });
        const body = (await res.json());
        if (!res.ok) {
            logger_1.logger.warn('virus scan hook error', { status: res.status, attachmentId: input.attachmentId });
            return { clean: true };
        }
        if (body.infected === true || body.clean === false) {
            return { clean: false, reason: body.reason ?? 'File failed virus scan' };
        }
        return { clean: true };
    }
    catch (err) {
        logger_1.logger.warn('virus scan hook unreachable', {
            attachmentId: input.attachmentId,
            error: err instanceof Error ? err.message : String(err),
        });
        return { clean: true };
    }
}
//# sourceMappingURL=virus-scan.hook.js.map