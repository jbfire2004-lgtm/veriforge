import { Prisma } from '@prisma/client';
import { hasAdminRole } from '../middleware/auth.middleware';
import { configRepository } from '../models/config.repository';
import type { AuthJwtPayload, ConfigEntryDto, ConfigNamespaceDto } from '../types';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

function toEntryDto(entry: {
  id: string;
  key: string;
  value: Prisma.JsonValue;
  version: number;
  companyId: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  namespace: { name: string };
}): ConfigEntryDto {
  return {
    id: entry.id,
    namespace: entry.namespace.name,
    key: entry.key,
    value: entry.value,
    version: entry.version,
    companyId: entry.companyId,
    updatedBy: entry.updatedBy,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function toNamespaceDto(ns: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ConfigNamespaceDto {
  return {
    id: ns.id,
    name: ns.name,
    description: ns.description,
    createdAt: ns.createdAt.toISOString(),
    updatedAt: ns.updatedAt.toISOString(),
  };
}

function resolveCompanyScope(
  auth: AuthJwtPayload,
  requestedCompanyId: string | null | undefined,
): string | null {
  if (requestedCompanyId === null || requestedCompanyId === undefined) {
    return null;
  }
  if (!hasAdminRole(auth.roles) && requestedCompanyId !== auth.company_id) {
    throw new ForbiddenError('Cannot access another company configuration');
  }
  return requestedCompanyId;
}

function assertCompanyListAccess(auth: AuthJwtPayload, requestedCompanyId?: string) {
  if (
    requestedCompanyId &&
    !hasAdminRole(auth.roles) &&
    requestedCompanyId !== auth.company_id
  ) {
    throw new ForbiddenError('Cannot list another company configuration');
  }
}

export const configService = {
  async listNamespaces(): Promise<ConfigNamespaceDto[]> {
    const rows = await configRepository.listNamespaces();
    return rows.map(toNamespaceDto);
  },

  async getEntry(
    auth: AuthJwtPayload,
    namespaceName: string,
    key: string,
    requestedCompanyId?: string,
  ): Promise<ConfigEntryDto> {
    const companyId = resolveCompanyScope(auth, requestedCompanyId ?? null);
    const ns = await configRepository.findNamespaceByName(namespaceName);
    if (!ns) throw new NotFoundError('Namespace not found');

    const entry = await configRepository.findEntry(ns.id, key, companyId);
    if (!entry) throw new NotFoundError('Config entry not found');
    return toEntryDto(entry);
  },

  async listNamespace(
    auth: AuthJwtPayload,
    namespaceName: string,
    requestedCompanyId?: string,
  ): Promise<ConfigEntryDto[]> {
    const ns = await configRepository.findNamespaceByName(namespaceName);
    if (!ns) throw new NotFoundError('Namespace not found');

    assertCompanyListAccess(auth, requestedCompanyId);

    let entries;
    if (hasAdminRole(auth.roles)) {
      if (requestedCompanyId === undefined) {
        entries = await configRepository.listByNamespace(ns.id, 'all');
      } else if (!requestedCompanyId) {
        entries = await configRepository.listByNamespace(ns.id, 'global_only');
      } else {
        entries = await configRepository.listByNamespace(
          ns.id,
          'global_and_company',
          requestedCompanyId,
        );
      }
    } else {
      entries = await configRepository.listByNamespace(
        ns.id,
        'global_and_company',
        auth.company_id,
      );
    }
    return entries.map(toEntryDto);
  },

  async upsert(
    auth: AuthJwtPayload,
    namespaceName: string,
    key: string,
    value: unknown,
    requestedCompanyId?: string | null,
    namespaceDescription?: string,
  ): Promise<ConfigEntryDto> {
    if (value === undefined) {
      throw new BadRequestError('value is required');
    }

    const companyId =
      requestedCompanyId === undefined || requestedCompanyId === null
        ? null
        : resolveCompanyScope(auth, requestedCompanyId);

    const ns = await configRepository.ensureNamespace(namespaceName, namespaceDescription);
    const entry = await configRepository.upsertEntry({
      namespaceId: ns.id,
      key,
      value: value as Prisma.InputJsonValue,
      companyId,
      updatedBy: auth.user_id,
      namespaceDescription,
    });
    return toEntryDto(entry);
  },

  async delete(
    auth: AuthJwtPayload,
    namespaceName: string,
    key: string,
    requestedCompanyId?: string | null,
  ): Promise<void> {
    const companyId =
      requestedCompanyId === undefined || requestedCompanyId === null
        ? null
        : resolveCompanyScope(auth, requestedCompanyId);

    const ns = await configRepository.findNamespaceByName(namespaceName);
    if (!ns) throw new NotFoundError('Namespace not found');

    const result = await configRepository.softDelete(ns.id, key, companyId);
    if (result.count === 0) throw new NotFoundError('Config entry not found');
  },
};
