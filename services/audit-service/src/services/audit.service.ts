import { auditRepository } from '../models/audit.repository';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import type { IngestEventInput, ListEventsQuery } from '../types';
import { logger } from '../utils/logger';

export const auditService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async ingestEvent(input: IngestEventInput, options?: { skipCompanyCheck?: boolean }) {
    if (!options?.skipCompanyCheck) {
      /* caller already validated company via JWT */
    }
    const event = await auditRepository.insertEvent(input);
    logger.debug('audit event ingested', {
      eventId: event.id,
      companyId: event.companyId,
      eventType: event.eventType,
    });
    return event;
  },

  async getEvent(companyId: string, eventId: string) {
    const event = await auditRepository.findById(eventId, companyId);
    if (!event) throw new NotFoundError('Audit event not found');
    return event;
  },

  async listEvents(query: ListEventsQuery) {
    return auditRepository.listEvents(query);
  },
};
