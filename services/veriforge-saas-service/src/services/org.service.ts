import { randomBytes } from 'crypto';
import type { ModuleCode, Prisma, SystemRoleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors';
import { hashPassword } from '../security/password';
import { encryptField } from '../security/field-encryption';
import { organizationService } from './organization.service';
import { moduleService } from './module.service';
import { orgProvisioningService } from './org-provisioning.service';
import { userService } from './user.service';
import { rbacService } from './rbac.service';
import { assertCanAssignRole } from '../security/tenant';
import { auditService } from './audit.service';
import { env } from '../config/env';
import type { JwtPayload } from '../types';

function isPlatformAdmin(auth: JwtPayload): boolean {
  return (
    env.platformAdminEmails.includes(auth.email.toLowerCase()) ||
    auth.permissions.includes('platform.admin')
  );
}

export class OrgService {
  assertSameOrg(auth: JwtPayload, orgId: string) {
    if (isPlatformAdmin(auth)) return;
    if (auth.org_id !== orgId) {
      throw new ForbiddenError('Cross-tenant access denied');
    }
  }

  async getDetail(orgId: string) {
    const organization = await organizationService.getById(orgId);
    const modules = await moduleService.listEnabled(orgId);
    const orgRoles = await prisma.orgRole.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
    });
    const events = await prisma.onboardingEvent.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { organization, modules, orgRoles, onboardingEvents: events };
  }

  async listUsers(orgId: string) {
    return userService.listByOrg(orgId);
  }

  async listModules(orgId: string) {
    return moduleService.listEnabled(orgId);
  }

  async updateModules(
    orgId: string,
    modules: { code: ModuleCode; enabled: boolean }[],
    actorId: string,
  ) {
    if (!modules.length) throw new BadRequestError('modules required');
    for (const m of modules) {
      await moduleService.setModuleEnabled(orgId, m.code, m.enabled);
    }
    const enabled = await orgProvisioningService.refreshModulesEnabledCache(orgId);
    await auditService.log({
      action: 'org.modules.update',
      orgId,
      actorId,
      meta: { modules, enabled },
    });
    return { modules: await this.listModules(orgId), modulesEnabled: enabled };
  }

  async createUser(
    auth: JwtPayload,
    input: {
      email: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      role?: Exclude<SystemRoleCode, 'owner'>;
      orgRoleName?: string;
    },
  ) {
    const orgId = auth.org_id;
    const role = input.role ?? 'user';
    assertCanAssignRole(auth.role, role);

    const email = input.email.toLowerCase().trim();
    const existing = await userService.findByOrgAndEmail(orgId, email);
    if (existing) throw new ConflictError('User already exists in this organization');

    const firstName = input.firstName?.trim() || null;
    const lastName = input.lastName?.trim() || null;
    const fullName =
      input.fullName?.trim() ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      email;

    const passwordHash = input.password
      ? await hashPassword(input.password)
      : await hashPassword(`${randomBytes(24).toString('base64url')}!A1`);

    const user = await prisma.user.create({
      data: {
        orgId,
        email,
        fullName,
        firstName,
        lastName,
        fullNameEnc: encryptField(fullName),
        passwordHash,
        status: input.password ? 'active' : 'invited',
      },
    });

    await rbacService.assignRole({
      orgId,
      userId: user.id,
      roleCode: role,
      assignedBy: auth.user_id,
    });

    if (input.orgRoleName) {
      const orgRole = await prisma.orgRole.findUnique({
        where: { orgId_name: { orgId, name: input.orgRoleName } },
      });
      if (orgRole) {
        await prisma.orgRoleUser.create({
          data: { orgRoleId: orgRole.id, userId: user.id },
        });
      }
    } else {
      const mapped = await prisma.orgRole.findFirst({
        where: { orgId, systemCode: role },
      });
      if (mapped) {
        await prisma.orgRoleUser.create({
          data: { orgRoleId: mapped.id, userId: user.id },
        });
      }
    }

    await auditService.log({
      action: 'org.user.create',
      orgId,
      actorId: auth.user_id,
      resource: 'user',
      resourceId: user.id,
      meta: { role },
    });

    return { user: await userService.toSafeUser(user.id) };
  }

  async createRole(
    auth: JwtPayload,
    input: {
      name: string;
      description?: string;
      permissions: string[];
      systemCode?: SystemRoleCode | null;
    },
  ) {
    const orgId = auth.org_id;
    const name = input.name.trim();
    if (name.length < 2) throw new BadRequestError('Role name too short');

    const existing = await prisma.orgRole.findUnique({
      where: { orgId_name: { orgId, name } },
    });
    if (existing) throw new ConflictError('Role name already exists');

    const role = await prisma.orgRole.create({
      data: {
        orgId,
        name,
        description: input.description?.trim() || null,
        permissions: (input.permissions ?? []) as unknown as Prisma.InputJsonValue,
        systemCode: input.systemCode ?? null,
      },
    });

    await auditService.log({
      action: 'org.role.create',
      orgId,
      actorId: auth.user_id,
      resource: 'org_role',
      resourceId: role.id,
    });

    return { role };
  }

  async listRoles(orgId: string) {
    return prisma.orgRole.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true } } },
    });
  }
}

export const orgService = new OrgService();
