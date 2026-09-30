"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.taskClient = {
    async fetchTask(taskId, companyId, token) {
        if (!env_1.env.pmTaskServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.pmTaskServiceUrl}/pm/task/${taskId}?company_id=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            const assignments = Array.isArray(body.assignments) ? body.assignments : [];
            const assignedWorkers = assignments
                .filter((a) => a.type === 'worker')
                .map((a) => String(a.assigneeId));
            const assignedEquipment = assignments
                .filter((a) => a.type === 'equipment')
                .map((a) => String(a.assigneeId));
            return {
                id: String(body.id),
                requirements: {
                    requiredSkills: toArr(body.requiredSkills ?? body.required_skills),
                    requiredEquipment: toArr(body.requiredEquipment ?? body.required_equipment),
                    requiredTraining: toArr(body.requiredTraining ?? body.required_training),
                    requiredControls: toArr(body.requiredControls ?? body.required_controls),
                    requiredPpe: toArr(body.requiredPpe ?? body.required_ppe),
                    requiredJha: toArr(body.requiredJha ?? body.required_jha),
                },
                assignedWorkers,
                assignedEquipment,
            };
        }
        catch (err) {
            logger_1.logger.warn('pm task service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
function toArr(value) {
    if (!Array.isArray(value))
        return [];
    return value.map(String);
}
