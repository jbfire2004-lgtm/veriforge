"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRepository = void 0;
const prisma_1 = require("../db/prisma");
const notDeleted = { deletedAt: null };
exports.configRepository = {
    findNamespaceByName(name) {
        return prisma_1.prisma.configNamespace.findUnique({ where: { name } });
    },
    ensureNamespace(name, description) {
        return prisma_1.prisma.configNamespace.upsert({
            where: { name },
            create: { name, description },
            update: description !== undefined ? { description } : {},
        });
    },
    listNamespaces() {
        return prisma_1.prisma.configNamespace.findMany({ orderBy: { name: 'asc' } });
    },
    findEntry(namespaceId, key, companyId) {
        return prisma_1.prisma.configEntry.findFirst({
            where: {
                namespaceId,
                key,
                companyId,
                ...notDeleted,
            },
            include: { namespace: true },
        });
    },
    findEntryIncludingDeleted(namespaceId, key, companyId) {
        return prisma_1.prisma.configEntry.findFirst({
            where: { namespaceId, key, companyId },
            include: { namespace: true },
            orderBy: { updatedAt: 'desc' },
        });
    },
    listByNamespace(namespaceId, scope, companyId) {
        const where = {
            namespaceId,
            ...notDeleted,
        };
        if (scope === 'all') {
            /* no company filter */
        }
        else if (scope === 'global_only') {
            where.companyId = null;
        }
        else {
            where.OR = [{ companyId: null }, { companyId: companyId }];
        }
        return prisma_1.prisma.configEntry.findMany({
            where,
            include: { namespace: true },
            orderBy: [{ companyId: 'asc' }, { key: 'asc' }],
        });
    },
    async upsertEntry(params) {
        const existing = await this.findEntryIncludingDeleted(params.namespaceId, params.key, params.companyId);
        if (existing?.deletedAt) {
            return prisma_1.prisma.configEntry.update({
                where: { id: existing.id },
                data: {
                    value: params.value,
                    version: existing.version + 1,
                    updatedBy: params.updatedBy,
                    deletedAt: null,
                },
                include: { namespace: true },
            });
        }
        if (existing) {
            return prisma_1.prisma.configEntry.update({
                where: { id: existing.id },
                data: {
                    value: params.value,
                    version: { increment: 1 },
                    updatedBy: params.updatedBy,
                },
                include: { namespace: true },
            });
        }
        return prisma_1.prisma.configEntry.create({
            data: {
                namespaceId: params.namespaceId,
                key: params.key,
                value: params.value,
                companyId: params.companyId,
                updatedBy: params.updatedBy,
                version: 1,
            },
            include: { namespace: true },
        });
    },
    softDelete(namespaceId, key, companyId) {
        return prisma_1.prisma.configEntry.updateMany({
            where: { namespaceId, key, companyId, ...notDeleted },
            data: { deletedAt: new Date() },
        });
    },
};
