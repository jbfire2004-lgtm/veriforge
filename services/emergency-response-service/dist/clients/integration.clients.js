"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationClients = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.integrationClients = {
    async activateSiteLockout(input) {
        const body = {
            company_id: input.companyId,
            project_id: input.projectId,
            mode: input.mode,
        };
        if (env_1.env.safetyStationsServiceUrl) {
            try {
                const res = await fetch(`${env_1.env.safetyStationsServiceUrl}/station/emergency/mode`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${input.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                if (res.ok)
                    return true;
            }
            catch (err) {
                logger_1.logger.warn('safety stations lockout failed', {
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
        return false;
    },
    async clearSiteLockout(input) {
        return this.activateSiteLockout({
            ...input,
            mode: 'all_clear',
        });
    },
    async sendNotification(input) {
        if (!env_1.env.notificationWebhookUrl)
            return 'pending';
        try {
            const res = await fetch(env_1.env.notificationWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });
            return res.ok ? 'sent' : 'failed';
        }
        catch (err) {
            logger_1.logger.warn('notification webhook failed', {
                error: err instanceof Error ? err.message : String(err),
            });
            return 'failed';
        }
    },
};
