import type { ModuleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { modulePermissionService, rbacService } from './rbac.service';
import { auditService } from './audit.service';
import {
  CacheKeys,
  CacheTtl,
  cacheDel,
  cacheGetJson,
  cacheSetJson,
} from '../lib/redis';

export class ModuleService {
  async listCatalog() {
    const cached = await cacheGetJson<unknown[]>(CacheKeys.moduleCatalog());
    if (cached) return cached;

    const rows = await prisma.module.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        prices: { where: { effectiveTo: null } },
      },
    });
    await cacheSetJson(CacheKeys.moduleCatalog(), rows, CacheTtl.modules);
    return rows;
  }

  async resolveModules(codes: ModuleCode[]) {
    const unique = [...new Set(codes)];
    const modules = await prisma.module.findMany({
      where: { code: { in: unique }, isActive: true },
    });
    if (modules.length !== unique.length) {
      throw new BadRequestError('One or more selected modules are invalid');
    }
    return modules;
  }

  async enableModules(orgId: string, codes: ModuleCode[], at = new Date()) {
    const modules = await this.resolveModules(codes);
    const now = at;

    await prisma.$transaction(async (tx) => {
      for (const mod of modules) {
        await tx.organizationModule.updateMany({
          where: { orgId, moduleId: mod.id, effectiveTo: null },
          data: { effectiveTo: now },
        });
        await tx.organizationModule.create({
          data: {
            orgId,
            moduleId: mod.id,
            enabled: true,
            effectiveFrom: now,
          },
        });
      }
    });

    await modulePermissionService.syncRolesForEnabledModules(codes);
    await cacheDel(CacheKeys.orgModules(orgId));
    await rbacService.invalidateOrgUsers(orgId);
  }

  async setModuleEnabled(orgId: string, moduleCode: ModuleCode, enabled: boolean) {
    const mod = await prisma.module.findUnique({ where: { code: moduleCode } });
    if (!mod) throw new NotFoundError(`Module not found: ${moduleCode}`);

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.organizationModule.updateMany({
        where: { orgId, moduleId: mod.id, effectiveTo: null },
        data: { effectiveTo: now },
      });
      await tx.organizationModule.create({
        data: {
          orgId,
          moduleId: mod.id,
          enabled,
          effectiveFrom: now,
        },
      });
    });

    if (enabled) {
      await modulePermissionService.syncRolesForEnabledModules([moduleCode]);
    }
    await auditService.log({
      action: enabled ? 'module.enabled' : 'module.disabled',
      orgId,
      resource: 'module',
      resourceId: mod.id,
      meta: { code: moduleCode },
    });
    await cacheDel(CacheKeys.orgModules(orgId));
    await rbacService.invalidateOrgUsers(orgId);
  }

  async listEnabled(orgId: string) {
    const cacheKey = CacheKeys.orgModules(orgId);
    const cached = await cacheGetJson<unknown[]>(cacheKey);
    if (cached) return cached;

    const rows = await prisma.organizationModule.findMany({
      where: { orgId, effectiveTo: null, enabled: true },
      include: { module: true },
    });
    await cacheSetJson(cacheKey, rows, CacheTtl.modules);
    return rows;
  }

  async lockAllModules(orgId: string, reason = 'trial_expired') {
    void reason;
    const now = new Date();
    const current = await prisma.organizationModule.findMany({
      where: { orgId, effectiveTo: null, enabled: true },
    });

    await prisma.$transaction(async (tx) => {
      for (const row of current) {
        await tx.organizationModule.update({
          where: { id: row.id },
          data: { effectiveTo: now },
        });
        await tx.organizationModule.create({
          data: {
            orgId,
            moduleId: row.moduleId,
            enabled: false,
            effectiveFrom: now,
          },
        });
      }
    });
    await cacheDel(CacheKeys.orgModules(orgId));
    await rbacService.invalidateOrgUsers(orgId);
  }
}

export const moduleService = new ModuleService();
