"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRepository = void 0;
const prisma_1 = require("../db/prisma");
function toDto(row) {
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
exports.auditRepository = {
    /** Append-only insert — no update/delete methods. */
    async insertEvent(input) {
        const row = await prisma_1.prisma.auditEvent.create({
            data: {
                companyId: input.companyId,
                module: input.module,
                eventType: input.eventType,
                actorId: input.actorId,
                eventData: input.eventData,
            },
        });
        return toDto(row);
    },
    async findById(id, companyId) {
        const row = await prisma_1.prisma.auditEvent.findFirst({
            where: { id, companyId },
        });
        return row ? toDto(row) : null;
    },
    async listEvents(query) {
        const where = {
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
            prisma_1.prisma.auditEvent.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: query.limit,
                skip: query.offset,
            }),
            prisma_1.prisma.auditEvent.count({ where }),
        ]);
        return {
            events: rows.map(toDto),
            total,
            limit: query.limit,
            offset: query.offset,
        };
    },
};
//# sourceMappingURL=audit.repository.js.map