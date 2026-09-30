"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workPackageClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.workPackageClient = {
    async verifyWorkPackage(workPackageId, companyId, token) {
        if (!env_1.env.pmWorkPackageServiceUrl)
            return true;
        try {
            const res = await fetch(`${env_1.env.pmWorkPackageServiceUrl}/pm/work-package/${workPackageId}?company_id=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.ok;
        }
        catch (err) {
            logger_1.logger.warn('work package service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return true;
        }
    },
};
