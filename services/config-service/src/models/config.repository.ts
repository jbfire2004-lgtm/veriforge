import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

const notDeleted = { deletedAt: null };

export type ConfigEntryRecord = Prisma.ConfigEntryGetPayload<{
  include: { namespace: true };
}>;

export const configRepository = {
  findNamespaceByName(name: string) {
    return prisma.configNamespace.findUnique({ where: { name } });
  },

  ensureNamespace(name: string, description?: string) {
    return prisma.configNamespace.upsert({
      where: { name },
      create: { name, description },
      update: description !== undefined ? { description } : {},
    });
  },

  listNamespaces() {
    return prisma.configNamespace.findMany({ orderBy: { name: 'asc' } });
  },

  findEntry(
    namespaceId: string,
    key: string,
    companyId: string | null,
  ): Promise<ConfigEntryRecord | null> {
    return prisma.configEntry.findFirst({
      where: {
        namespaceId,
        key,
        companyId,
        ...notDeleted,
      },
      include: { namespace: true },
    });
  },

  findEntryIncludingDeleted(
    namespaceId: string,
    key: string,
    companyId: string | null,
  ): Promise<ConfigEntryRecord | null> {
    return prisma.configEntry.findFirst({
      where: { namespaceId, key, companyId },
      include: { namespace: true },
      orderBy: { updatedAt: 'desc' },
    });
  },

  listByNamespace(
    namespaceId: string,
    scope: 'all' | 'global_only' | 'global_and_company',
    companyId?: string,
  ) {
    const where: Prisma.ConfigEntryWhereInput = {
      namespaceId,
      ...notDeleted,
    };

    if (scope === 'all') {
      /* no company filter */
    } else if (scope === 'global_only') {
      where.companyId = null;
    } else {
      where.OR = [{ companyId: null }, { companyId: companyId! }];
    }

    return prisma.configEntry.findMany({
      where,
      include: { namespace: true },
      orderBy: [{ companyId: 'asc' }, { key: 'asc' }],
    });
  },

  async upsertEntry(params: {
    namespaceId: string;
    key: string;
    value: Prisma.InputJsonValue;
    companyId: string | null;
    updatedBy: string;
    namespaceDescription?: string;
  }): Promise<ConfigEntryRecord> {
    const existing = await this.findEntryIncludingDeleted(
      params.namespaceId,
      params.key,
      params.companyId,
    );

    if (existing?.deletedAt) {
      return prisma.configEntry.update({
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
      return prisma.configEntry.update({
        where: { id: existing.id },
        data: {
          value: params.value,
          version: { increment: 1 },
          updatedBy: params.updatedBy,
        },
        include: { namespace: true },
      });
    }

    return prisma.configEntry.create({
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

  softDelete(namespaceId: string, key: string, companyId: string | null) {
    return prisma.configEntry.updateMany({
      where: { namespaceId, key, companyId, ...notDeleted },
      data: { deletedAt: new Date() },
    });
  },
};
