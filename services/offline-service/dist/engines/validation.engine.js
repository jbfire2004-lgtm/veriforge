"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationEngine = exports.ValidationEngine = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const REQUIRED = {
    'pm-hazard': ['clientSyncId'],
    'pm-control': ['clientSyncId'],
    'pm-corrective-action': ['clientSyncId'],
    'pm-inspection': ['clientSyncId'],
    'pm-incident': ['clientSyncId'],
    'pm-training': ['clientSyncId'],
    'pm-project': ['projectId'],
    'pm-cail': ['clientSyncId'],
};
class ValidationEngine {
    validateLocal(moduleType, payload) {
        const errors = [];
        if (!moduleType?.trim())
            errors.push('module type is required');
        const required = REQUIRED[moduleType];
        if (required) {
            for (const key of required) {
                if (payload[key] == null || payload[key] === '') {
                    errors.push(`Missing required field: ${key}`);
                }
            }
        }
        return errors;
    }
    async validateWithHook(moduleType, payload) {
        const localErrors = this.validateLocal(moduleType, payload);
        if (localErrors.length > 0)
            return localErrors;
        if (!env_1.env.validationHookUrl)
            return [];
        try {
            const res = await fetch(env_1.env.validationHookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleType, payload }),
                signal: AbortSignal.timeout(5000),
            });
            const body = (await res.json());
            if (!res.ok || body.valid === false) {
                return body.errors ?? ['Validation hook rejected payload'];
            }
        }
        catch (err) {
            logger_1.logger.warn('validation hook failed', {
                moduleType,
                error: err instanceof Error ? err.message : String(err),
            });
        }
        return [];
    }
}
exports.ValidationEngine = ValidationEngine;
exports.validationEngine = new ValidationEngine();
