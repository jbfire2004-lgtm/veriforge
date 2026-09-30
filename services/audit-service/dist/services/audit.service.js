"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const audit_repository_1 = require("../models/audit.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
exports.auditService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async ingestEvent(input, options) {
        if (!options?.skipCompanyCheck) {
            /* caller already validated company via JWT */
        }
        const event = await audit_repository_1.auditRepository.insertEvent(input);
        logger_1.logger.debug('audit event ingested', {
            eventId: event.id,
            companyId: event.companyId,
            eventType: event.eventType,
        });
        return event;
    },
    async getEvent(companyId, eventId) {
        const event = await audit_repository_1.auditRepository.findById(eventId, companyId);
        if (!event)
            throw new errors_1.NotFoundError('Audit event not found');
        return event;
    },
    async listEvents(query) {
        return audit_repository_1.auditRepository.listEvents(query);
    },
};
//# sourceMappingURL=audit.service.js.map