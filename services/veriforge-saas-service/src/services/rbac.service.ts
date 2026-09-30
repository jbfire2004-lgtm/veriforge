import type { ModuleCode, SystemRoleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import type { JwtPayload, SafeUser } from '../types';
import { env } from '../config/env';
import {
  isOrgOrPlatformPermission,
  MODULE_PERMISSION_BUNDLES,
  PERMISSION_CATALOG,
  ROLE_PERMISSION_DEFAULTS,
  type PermissionKey,
} from '../rbac/permission-catalog';
import {
  CacheKeys,
  CacheTtl,
  cacheDel,
  cacheGetJson,
  cacheSetJson,
} from '../lib/redis';

type AuthSubject =
  | Pick<SafeUser, 'id' | 'orgId' | 'permissions' | 'role' | 'email'>
  | JwtPayload
  | { permissions: string[]; email?: string; orgId?: string; org_id?: string };

type UserAccess = {
  role: SystemRoleCode | null;
  permissions: string[];
  orgId: string | null;
};

function subjectOrgId(user: AuthSubject): string | undefined {
  if ('orgId' in user && user.orgId) return user.orgId;
  if ('org_id' in user && user.org_id) return user.org_id;
  return undefined;
}

function subjectPermissions(user: AuthSubject): string[] {
  return user.permissions ?? [];
}

function subjectEmail(user: AuthSubject): string {
  return ('email' in user && user.email ? user.email : '').toLowerCase();
}

export class RBACService {
  async loadPermissionsForUser(userId: string): Promise<string[]> {
    const access = await this.loadUserAccess(userId);
    return access.permissions;
  }

  async loadUserAccess(userId: string): Promise<UserAccess> {
    const cached = await cacheGetJson<UserAccess>(CacheKeys.rbacUser(userId));
    if (cached) return cached;

    const access = await this.loadUserAccessFromDb(userId);
    await cacheSetJson(CacheKeys.rbacUser(userId), access, CacheTtl.rbac);
    return access;
  }

  /**
   * Optimized RBAC load:
   * 1) user org
   * 2) active role + permission keys (flat select)
   * 3) enabled-module permission keys for org (flat select)
   */
  private async loadUserAccessFromDb(userId: string): Promise<UserAccess> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, orgId: true },
    });
    if (!user) {
      return { role: null, permissions: [], orgId: null };
    }

    const assignment = await prisma.userRole.findFirst({
      where: { userId, revokedAt: null },
      select: {
        role: {
          select: {
            code: true,
            rolePermissions: {
              select: { permission: { select: { key: true } } },
            },
          },
        },
      },
    });

    if (!assignment) {
      return { role: null, permissions: [], orgId: user.orgId };
    }

    const roleKeys = assignment.role.rolePermissions.map((rp) => rp.permission.key);
    const effective = await this.filterByEnabledModules(user.orgId, roleKeys);

    return {
      role: assignment.role.code,
      permissions: [...new Set(effective)],
      orgId: user.orgId,
    };
  }

  async filterByEnabledModules(orgId: string, roleKeys: string[]): Promise<string[]> {
    const rows = await prisma.organizationModule.findMany({
      where: { orgId, effectiveTo: null, enabled: true },
      select: {
        module: {
          select: {
            modulePermissions: {
              select: { permission: { select: { key: true } } },
            },
          },
        },
      },
    });

    const enabledModuleKeys = new Set(
      rows.flatMap((row) => row.module.modulePermissions.map((mp) => mp.permission.key)),
    );

    return roleKeys.filter(
      (key) => isOrgOrPlatformPermission(key) || enabledModuleKeys.has(key),
    );
  }

  async invalidateUser(userId: string): Promise<void> {
    await cacheDel(CacheKeys.rbacUser(userId));
  }

  async invalidateOrgUsers(orgId: string): Promise<void> {
    const users = await prisma.user.findMany({
      where: { orgId },
      select: { id: true },
      take: 5000,
    });
    if (users.length) {
      await cacheDel(...users.map((u) => CacheKeys.rbacUser(u.id)));
    }
  }

  can(user: AuthSubject, permissionKey: string): boolean {
    if (env.platformAdminEmails.includes(subjectEmail(user))) {
      return true;
    }
    return subjectPermissions(user).includes(permissionKey);
  }

  canAny(user: AuthSubject, keys: string[]): boolean {
    return keys.some((k) => this.can(user, k));
  }

  canAll(user: AuthSubject, keys: string[]): boolean {
    return keys.every((k) => this.can(user, k));
  }

  assertCan(user: AuthSubject, permissionKey: string): void {
    if (!this.can(user, permissionKey)) {
      throw new ForbiddenError(`Missing permission: ${permissionKey}`);
    }
  }

  assertSameOrg(user: AuthSubject, orgId: string): void {
    const uid = subjectOrgId(user);
    if (!uid || uid !== orgId) {
      throw new ForbiddenError('Cross-tenant access denied');
    }
  }

  async assignRole(input: {
    orgId: string;
    userId: string;
    roleCode: SystemRoleCode;
    assignedBy?: string;
  }): Promise<void> {
    const role = await prisma.role.findUnique({ where: { code: input.roleCode } });
    if (!role) throw new NotFoundError(`Role not found: ${input.roleCode}`);

    await prisma.$transaction(async (tx) => {
      await tx.userRole.updateMany({
        where: { userId: input.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.userRole.create({
        data: {
          orgId: input.orgId,
          userId: input.userId,
          roleId: role.id,
          assignedBy: input.assignedBy,
        },
      });
    });

    await this.invalidateUser(input.userId);
  }
}

export class ModulePermissionService {
  async syncCatalog(): Promise<void> {
    for (const def of PERMISSION_CATALOG) {
      await prisma.permission.upsert({
        where: { key: def.key },
        create: { key: def.key, name: def.name },
        update: { name: def.name },
      });
    }

    const permissions = await prisma.permission.findMany();
    const byKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]));

    const modules = await prisma.module.findMany();
    for (const mod of modules) {
      const bundle = MODULE_PERMISSION_BUNDLES[mod.code] ?? [];
      await prisma.modulePermission.createMany({
        data: bundle
          .filter((key) => byKey[key])
          .map((key) => ({ moduleId: mod.id, permissionId: byKey[key]! })),
        skipDuplicates: true,
      });
    }

    const roles = await prisma.role.findMany();
    for (const role of roles) {
      const keys = ROLE_PERMISSION_DEFAULTS[role.code] ?? [];
      await prisma.rolePermission.createMany({
        data: keys
          .filter((key) => byKey[key])
          .map((key) => ({ roleId: role.id, permissionId: byKey[key]! })),
        skipDuplicates: true,
      });
    }
  }

  async syncRolesForEnabledModules(moduleCodes: ModuleCode[]): Promise<void> {
    if (moduleCodes.length === 0) return;
    await this.syncCatalog();

    const permissions = await prisma.permission.findMany();
    const byKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]));
    const roles = await prisma.role.findMany();
    const roleByCode = Object.fromEntries(roles.map((r) => [r.code, r.id])) as Record<
      SystemRoleCode,
      string
    >;

    const rows: { roleId: string; permissionId: string }[] = [];

    for (const code of moduleCodes) {
      const bundle = MODULE_PERMISSION_BUNDLES[code] ?? [];
      for (const roleCode of Object.keys(ROLE_PERMISSION_DEFAULTS) as SystemRoleCode[]) {
        const allowed = new Set(ROLE_PERMISSION_DEFAULTS[roleCode]);
        for (const key of bundle) {
          if (!allowed.has(key)) continue;
          const permissionId = byKey[key];
          const roleId = roleByCode[roleCode];
          if (permissionId && roleId) {
            rows.push({ roleId, permissionId });
          }
        }
      }
    }

    const uniq = new Map(rows.map((r) => [`${r.roleId}:${r.permissionId}`, r]));
    await prisma.rolePermission.createMany({
      data: [...uniq.values()],
      skipDuplicates: true,
    });
  }

  keysForRoleAndModule(role: SystemRoleCode, module: ModuleCode): PermissionKey[] {
    const allowed = new Set(ROLE_PERMISSION_DEFAULTS[role]);
    return (MODULE_PERMISSION_BUNDLES[module] ?? []).filter((k) => allowed.has(k));
  }
}

export const rbacService = new RBACService();
export const modulePermissionService = new ModulePermissionService();
