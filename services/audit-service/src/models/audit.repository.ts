import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { IngestEventInput, ListEventsQuery } from '../types';

function toDto(row: {
  id: string;
  companyId: string;
  module: string;
  eventType: string;
  actorId: string;
  eventData: unknown;
  createdAt: Date;
}) {
  return {
    id: row.id,
    companyId: row.companyId,
    module: row.module,
    eventType: row.eventType,
    actorId: row.actorId,
    eventData: row.eventData,
    createdAt: row.createdAt.toISOString(),
  };
}

export const auditRepository = {
  /** Append-only insert — no update/delete methods. */
  async insertEvent(input: IngestEventInput) {
    const row = await prisma.auditEvent.create({
      data: {
        companyId: input.companyId,
        module: input.module,
        eventType: input.eventType,
        actorId: input.actorId,
        eventData: input.eventData as Prisma.InputJsonValue,
      },
    });
    return toDto(row);
  },

  async findById(id: string, companyId: string) {
    const row = await prisma.auditEvent.findFirst({
      where: { id, companyId },
    });
    return row ? toDto(row) : null;
  },

  async listEvents(query: ListEventsQuery) {
    const where: Prisma.AuditEventWhereInput = {
      companyId: query.companyId,
      ...(query.module ? { module: query.module } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.eventType ? { eventType: query.eventType } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {}),
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.auditEvent.count({ where }),
    ]);

    return {
      events: rows.map(toDto),
      total,
      limit: query.limit,
      offset: query.offset,
    };
  },
};
