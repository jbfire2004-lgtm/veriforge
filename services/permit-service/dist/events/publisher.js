"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventPublisher = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.eventPublisher = {
    async publish(subject, payload) {
        if (env_1.env.natsBridgeUrl) {
            try {
                const res = await fetch(env_1.env.natsBridgeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, data: payload }),
                });
                if (!res.ok) {
                    logger_1.logger.warn('event publish rejected', { subject, status: res.status });
                }
                return;
            }
            catch (err) {
                logger_1.logger.warn('event publish failed', {
                    subject,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
        logger_1.logger.info('event publish (stub)', { subject, payload });
    },
    permitRequested(payload) {
        return this.publish('pm.permit.requested', payload);
    },
    permitApproved(payload) {
        return this.publish('pm.permit.approved', payload);
    },
    permitActive(payload) {
        return this.publish('pm.permit.active', payload);
    },
};
