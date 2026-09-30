import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  AcpTenantStatus,
  AcpSubscriptionStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction } from '../audit/audit-actions';

@Injectable()
export class AcpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  private async audit(
    actorUserId: number | undefined,
    action: string,
    entityType: string,
    entityId: string | undefined,
    tenantId?: string | null,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.acpAuditLog.create({
      data: {
        actorUserId,
        tenantId: tenantId ?? undefined,
        action,
        entityType,
        entityId,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    const centralAction = mapAcpActionToCentral(action);
    if (centralAction) {
      await this.auditLog.logAudit(
        { id: actorUserId ?? null },
        centralAction,
        {
          type: entityType,
          id: entityId ?? 'unknown',
        },
        { ...metadata, acpTenantId: tenantId ?? null },
      );
    }
  }

  // ——— Tenants ———
  listTenants() {
    return this.prisma.acpTenant.findMany({
      include: {
        subscription: { include: { tier: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTenant(id: string) {
    const row = await this.prisma.acpTenant.findUnique({
      where: { id },
      include: {
        subscription: { include: { tier: true } },
        tenantFeatureFlags: { include: { featureFlag: true } },
        users: {
          select: { id: true, email: true, username: true, role: true },
        },
      },
    });
    if (!row) throw new NotFoundException('Tenant not found');
    return row;
  }

  async createTenant(
    data: {
      slug: string;
      name: string;
      companyId?: number;
      status?: AcpTenantStatus;
    },
    actorId?: number,
  ) {
    const row = await this.prisma.acpTenant.create({
      data: {
        slug: data.slug,
        name: data.name,
        companyId: data.companyId,
        status: data.status ?? AcpTenantStatus.ACTIVE,
      },
    });
    const tier =
      (await this.prisma.acpSubscriptionTier.findUnique({
        where: { key: 'basic' },
      })) ??
      (await this.prisma.acpSubscriptionTier.findUnique({
        where: { key: 'free' },
      }));
    if (tier) {
      await this.prisma.acpTenantSubscription.create({
        data: {
          tenantId: row.id,
          tierId: tier.id,
          status: AcpSubscriptionStatus.ACTIVE,
        },
      });
    }
    await this.audit(actorId, 'tenant.created', 'tenant', row.id, row.id);
    return this.getTenant(row.id);
  }

  async updateTenant(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      status: AcpTenantStatus;
      companyId: number | null;
    }>,
    actorId?: number,
  ) {
    await this.getTenant(id);
    await this.prisma.acpTenant.update({ where: { id }, data });
    await this.audit(actorId, 'tenant.updated', 'tenant', id, id, data);
    return this.getTenant(id);
  }

  async deleteTenant(id: string, actorId?: number) {
    await this.getTenant(id);
    await this.prisma.acpTenant.delete({ where: { id } });
    await this.audit(actorId, 'tenant.deleted', 'tenant', id, id);
    return { ok: true };
  }

  // ——— Users ———
  listUsers(tenantId?: string) {
    return this.prisma.user.findMany({
      where: tenantId ? { acpTenantId: tenantId } : undefined,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        active: true,
        acpTenantId: true,
        createdAt: true,
        acpUserRoles: {
          include: { role: { select: { id: true, key: true, name: true } } },
        },
      },
      orderBy: { email: 'asc' },
      take: 500,
    });
  }

  async createUser(
    data: {
      email: string;
      username: string;
      password: string;
      role?: string;
      acpTenantId?: string;
    },
    actorId?: number,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestException('Email already registered');

    const hash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hash,
        role: (data.role as UserRole) ?? UserRole.WORKER,
        acpTenantId: data.acpTenantId,
        active: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        active: true,
        acpTenantId: true,
      },
    });
    await this.audit(
      actorId,
      'user.created',
      'user',
      String(user.id),
      data.acpTenantId,
      {
        email: data.email,
        role: user.role,
      },
    );
    return user;
  }

  async deleteUser(userId: number, actorId?: number) {
    const user = await this.getUser(userId);
    await this.prisma.user.delete({ where: { id: userId } });
    await this.audit(
      actorId,
      'user.deleted',
      'user',
      String(userId),
      user.acpTenantId ?? undefined,
    );
    return { ok: true };
  }

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        active: true,
        acpTenantId: true,
        companyId: true,
        createdAt: true,
        acpUserRoles: {
          include: { role: { select: { id: true, key: true, name: true } } },
        },
        worker: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(
    userId: number,
    data: { role?: string; acpTenantId?: string | null; active?: boolean },
    actorId?: number,
  ) {
    await this.getUser(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role ? { role: data.role as never } : {}),
        ...(data.acpTenantId !== undefined
          ? { acpTenantId: data.acpTenantId }
          : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });
    await this.audit(
      actorId,
      'user.updated',
      'user',
      String(userId),
      user.acpTenantId ?? undefined,
      data,
    );
    return this.getUser(userId);
  }

  async setUserActive(userId: number, active: boolean, actorId?: number) {
    return this.updateUser(userId, { active }, actorId);
  }

  async assignUserTenant(
    userId: number,
    tenantId: string | null,
    actorId?: number,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { acpTenantId: tenantId },
    });
    await this.audit(
      actorId,
      'user.tenant_assigned',
      'user',
      String(userId),
      tenantId ?? undefined,
      {
        tenantId,
      },
    );
    return user;
  }

  async setTenantFeatureKeys(
    tenantId: string,
    featureKeys: string[],
    enabled: boolean,
    actorId?: number,
  ) {
    await this.getTenant(tenantId);
    const flags = await this.prisma.acpFeatureFlag.findMany({
      where: { key: { in: featureKeys } },
    });
    const results = [];
    for (const flag of flags) {
      results.push(
        await this.setTenantFeatureFlag(tenantId, flag.id, enabled, actorId),
      );
    }
    await this.audit(
      actorId,
      'tenant.addons_updated',
      'tenant',
      tenantId,
      tenantId,
      {
        featureKeys,
        enabled,
      },
    );
    return results;
  }

  async setTenantModules(
    tenantId: string,
    featureKeys: string[],
    actorId?: number,
  ) {
    await this.getTenant(tenantId);
    const flags = await this.prisma.acpFeatureFlag.findMany();
    const results = [];
    for (const flag of flags) {
      const on = featureKeys.includes(flag.key);
      results.push(
        await this.setTenantFeatureFlag(tenantId, flag.id, on, actorId),
      );
    }
    await this.audit(
      actorId,
      'tenant.modules_updated',
      'tenant',
      tenantId,
      tenantId,
      {
        featureKeys,
      },
    );
    return { updated: results.length, featureKeys };
  }

  // ——— Roles ———
  listRoles(tenantId?: string) {
    return this.prisma.acpRole.findMany({
      where: tenantId !== undefined ? { tenantId } : {},
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createRole(
    data: {
      key: string;
      name: string;
      description?: string;
      tenantId?: string;
    },
    actorId?: number,
  ) {
    const row = await this.prisma.acpRole.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        tenantId: data.tenantId,
      },
    });
    await this.audit(actorId, 'role.created', 'role', row.id, data.tenantId);
    return row;
  }

  async updateRole(
    id: string,
    data: Partial<{ name: string; description: string }>,
    actorId?: number,
  ) {
    const row = await this.prisma.acpRole.update({ where: { id }, data });
    await this.audit(
      actorId,
      'role.updated',
      'role',
      id,
      row.tenantId ?? undefined,
    );
    return row;
  }

  async deleteRole(id: string, actorId?: number) {
    const row = await this.prisma.acpRole.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Role not found');
    if (row.isSystem)
      throw new BadRequestException('Cannot delete system role');
    await this.prisma.acpRole.delete({ where: { id } });
    await this.audit(
      actorId,
      'role.deleted',
      'role',
      id,
      row.tenantId ?? undefined,
    );
    return { ok: true };
  }

  async assignUserRole(
    userId: number,
    roleId: string,
    tenantId?: string,
    actorId?: number,
  ) {
    const row = await this.prisma.acpUserRole.create({
      data: { userId, roleId, tenantId },
      include: { role: true },
    });
    await this.audit(
      actorId,
      'user.role_assigned',
      'user_role',
      row.id,
      tenantId,
      {
        userId,
        roleId,
      },
    );
    return row;
  }

  async removeUserRole(
    userId: number,
    roleId: string,
    tenantId?: string,
    actorId?: number,
  ) {
    const existing = await this.prisma.acpUserRole.findFirst({
      where: { userId, roleId, tenantId: tenantId ?? null },
    });
    if (!existing)
      throw new NotFoundException('User role assignment not found');
    await this.prisma.acpUserRole.delete({ where: { id: existing.id } });
    await this.audit(
      actorId,
      'user.role_removed',
      'user_role',
      existing.id,
      tenantId,
      {
        userId,
        roleId,
      },
    );
    return { ok: true };
  }

  // ——— Permissions ———
  listPermissions() {
    return this.prisma.acpPermission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });
  }

  async getPermissionMatrix() {
    const [roles, permissions] = await Promise.all([
      this.listRoles(),
      this.listPermissions(),
    ]);
    return { roles, permissions };
  }

  async setRolePermissions(
    roleId: string,
    permissionIds: string[],
    actorId?: number,
  ) {
    await this.prisma.acpRolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length) {
      await this.prisma.acpRolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      });
    }
    const role = await this.prisma.acpRole.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
    await this.audit(
      actorId,
      'role.permissions_updated',
      'role',
      roleId,
      role?.tenantId ?? undefined,
      {
        permissionIds,
      },
    );
    return role;
  }

  // ——— Subscriptions ———
  listTiers() {
    return this.prisma.acpSubscriptionTier.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async assignTenantSubscription(
    tenantId: string,
    tierId: string,
    status?: AcpSubscriptionStatus,
    actorId?: number,
  ) {
    await this.getTenant(tenantId);
    const row = await this.prisma.acpTenantSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        tierId,
        status: status ?? AcpSubscriptionStatus.ACTIVE,
      },
      update: { tierId, status: status ?? AcpSubscriptionStatus.ACTIVE },
      include: { tier: true },
    });
    await this.audit(
      actorId,
      'subscription.assigned',
      'tenant_subscription',
      row.id,
      tenantId,
      {
        tierId,
      },
    );
    return row;
  }

  // ——— Feature flags ———
  listFeatureFlags() {
    return this.prisma.acpFeatureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async setTenantFeatureFlag(
    tenantId: string,
    featureFlagId: string,
    enabled: boolean,
    actorId?: number,
  ) {
    const row = await this.prisma.acpTenantFeatureFlag.upsert({
      where: { tenantId_featureFlagId: { tenantId, featureFlagId } },
      create: { tenantId, featureFlagId, enabled },
      update: { enabled },
      include: { featureFlag: true },
    });
    await this.audit(
      actorId,
      'feature_flag.toggled',
      'tenant_feature_flag',
      featureFlagId,
      tenantId,
      {
        enabled,
      },
    );
    return row;
  }

  async updateFeatureFlagDefault(
    id: string,
    defaultEnabled: boolean,
    actorId?: number,
  ) {
    const row = await this.prisma.acpFeatureFlag.update({
      where: { id },
      data: { defaultEnabled },
    });
    await this.audit(
      actorId,
      'feature_flag.default_updated',
      'feature_flag',
      id,
    );
    return row;
  }

  // ——— Audit logs ———
  listAuditLogs(params?: { tenantId?: string; limit?: number }) {
    return this.prisma.acpAuditLog.findMany({
      where: params?.tenantId ? { tenantId: params.tenantId } : undefined,
      include: { actor: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: params?.limit ?? 100,
    });
  }
}

function mapAcpActionToCentral(action: string): string | null {
  switch (action) {
    case 'role.created':
      return AuditAction.ACP_ROLE_CREATED;
    case 'role.updated':
      return AuditAction.ACP_ROLE_UPDATED;
    case 'role.deleted':
      return AuditAction.ACP_ROLE_DELETED;
    case 'user.role_assigned':
      return AuditAction.ACP_USER_ROLE_ASSIGNED;
    case 'user.role_removed':
      return AuditAction.ACP_USER_ROLE_REMOVED;
    case 'role.permissions_updated':
      return AuditAction.ACP_PERMISSIONS_UPDATED;
    default:
      return null;
  }
}
