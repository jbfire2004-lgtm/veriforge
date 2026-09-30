"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cailClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.cailClient = {
    async predictScheduleDelay(input, token) {
        if (!env_1.env.cailServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.cailServiceUrl}/predict`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyId: input.companyId,
                    projectId: input.projectId,
                    taskId: input.taskId,
                    workerId: input.workerId,
                    equipmentId: input.equipmentId,
                    predictionType: 'schedule_delay',
                    context: {
                        startTime: input.startTime,
                        endTime: input.endTime,
                    },
                }),
            });
            if (!res.ok)
                return null;
            const body = (await res.json());
            return {
                predictionType: 'schedule_delay',
                probability: typeof body.probability === 'number' ? body.probability : undefined,
                predictedDelayHours: typeof body.predictedDelayHours === 'number'
                    ? body.predictedDelayHours
                    : typeof body.predicted_delay_hours === 'number'
                        ? body.predicted_delay_hours
                        : undefined,
                reason: typeof body.reason === 'string' ? body.reason : undefined,
                recommendation: typeof body.recommendation === 'string'
                    ? body.recommendation
                    : typeof body.summary === 'string'
                        ? body.summary
                        : undefined,
                raw: body,
            };
        }
        catch (err) {
            logger_1.logger.warn('cail service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
