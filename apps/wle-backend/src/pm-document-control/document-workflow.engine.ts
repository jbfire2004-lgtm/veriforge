import { BadRequestException } from '@nestjs/common';
import { PmDocumentStatus } from '@prisma/client';

const TRANSITIONS: Record<PmDocumentStatus, PmDocumentStatus[]> = {
  draft: ['review', 'archived'],
  review: ['approved', 'draft', 'archived'],
  approved: ['published', 'review', 'archived'],
  published: ['superseded', 'archived'],
  superseded: ['archived'],
  archived: [],
};

export class DocumentWorkflowEngine {
  assertTransition(from: PmDocumentStatus, to: PmDocumentStatus) {
    const allowed = TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Invalid document transition: ${from} → ${to}`,
      );
    }
  }

  publishFields(now = new Date()) {
    return { publishedAt: now, status: 'published' as PmDocumentStatus };
  }

  supersedeFields(now = new Date()) {
    return {
      status: 'superseded' as PmDocumentStatus,
      supersededAt: now,
    };
  }

  archiveFields(now = new Date()) {
    return {
      status: 'archived' as PmDocumentStatus,
      archivedAt: now,
    };
  }
}
