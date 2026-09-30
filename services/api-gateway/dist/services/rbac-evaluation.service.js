"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacEvaluation = void 0;
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const http_method_action_1 = require("../utils/http-method-action");
exports.rbacEvaluation = {
    async evaluate(params) {
        if (!env_1.env.rbacEnabled) {
            return { allow: true, reason: 'RBAC enforcement disabled' };
        }
        const url = `${env_1.env.rbacServiceUrl}${env_1.env.rbacEvaluatePath}`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${params.token}`,
                },
                body: JSON.stringify({
                    user_id: params.userId,
                    company_id: params.companyId,
                    resource: params.resource,
                    action: params.action,
                }),
                signal: AbortSignal.timeout(5000),
            });
            const body = (await res.json());
            if (!res.ok) {
                logger_1.logger.warn('rbac evaluate error', { status: res.status, body });
                throw new errors_1.ForbiddenError(body.reason ?? 'Permission denied');
            }
            if (!body.allow) {
                throw new errors_1.ForbiddenError(body.reason ?? 'Permission denied');
            }
            return { allow: true, reason: body.reason ?? 'Allowed' };
        }
        catch (err) {
            if (err instanceof errors_1.ForbiddenError)
                throw err;
            logger_1.logger.error('rbac service unreachable', {
                error: err instanceof Error ? err.message : String(err),
            });
            throw new errors_1.ForbiddenError('RBAC service unavailable');
        }
    },
    evaluateFromRequest(token, userId, companyId, resource, method) {
        return this.evaluate({
            token,
            userId,
            companyId,
            resource,
            action: (0, http_method_action_1.actionFromMethod)(method),
        });
    },
};
//# sourceMappingURL=rbac-evaluation.service.js.map