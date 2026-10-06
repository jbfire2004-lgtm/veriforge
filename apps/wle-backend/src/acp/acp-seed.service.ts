import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACP_FEATURE_FLAGS,
  ACP_PERMISSIONS,
  ACP_SUBSCRIPTION_TIERS,
} from './acp.constants';

@Injectable()
export class AcpSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedCatalog();
  }

  async seedCatalog(): Promise<void> {
    for (const p of ACP_PERMISSIONS) {
      await this.prisma.acpPermission.upsert({
        where: { key: p.key },
        create: {
          key: p.key,
          module: p.module,
          action: p.action,
          description: p.description,
        },
        update: {
          module: p.module,
          action: p.action,
          description: p.description,
        },
      });
    }

    for (const t of ACP_SUBSCRIPTION_TIERS) {
      await this.prisma.acpSubscriptionTier.upsert({
        where: { key: t.key },
        create: {
          key: t.key,
          name: t.name,
          sortOrder: t.sortOrder,
          limitsJson: t.limitsJson,
          featuresJson: t.featuresJson,
        },
        update: {
          name: t.name,
          sortOrder: t.sortOrder,
          limitsJson: t.limitsJson,
          featuresJson: t.featuresJson,
        },
      });
    }

    for (const f of ACP_FEATURE_FLAGS) {
      await this.prisma.acpFeatureFlag.upsert({
        where: { key: f.key },
        create: {
          key: f.key,
          name: f.name,
          module: f.module,
          requiredTierKey: f.requiredTierKey,
          defaultEnabled: f.defaultEnabled,
        },
        update: {
          name: f.name,
          module: f.module,
          requiredTierKey: f.requiredTierKey,
          defaultEnabled: f.defaultEnabled,
        },
      });
    }

    await this.ensurePlatformAdminRole();
    await this.ensureCompanyAdminRole();
    await this.assignPlatformAdminToLegacyAdmins();
  }

  /** Default tenant admin role — Hub + Core + PM (no ACP manage). */
  private async ensureCompanyAdminRole(): Promise<void> {
    let role = await this.prisma.acpRole.findFirst({
      where: { key: 'company_admin', tenantId: null },
    });
    if (!role) {
      role = await this.prisma.acpRole.create({
        data: {
          key: 'company_admin',
          name: 'Company Administrator',
          description: 'Full Hub, Core, and PM access for a tenant',
          isSystem: true,
        },
      });
    }

    const keys = [
      'hub.dashboard',
      'core.access',
      'pm.access',
      'pm.safety_hub',
      'pm.inspections',
      'pm.incidents',
      'pm.capa',
      'pm.sms',
      'pm.safety_forms',
      'pm.substance_testing',
      'contractor.portal',
      'admin.workers',
      'admin.equipment',
      'admin.training',
    ];
    const perms = await this.prisma.acpPermission.findMany({
      where: { key: { in: keys } },
    });
    for (const p of perms) {
      await this.prisma.acpRolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        create: { roleId: role.id, permissionId: p.id },
        update: {},
      });
    }
  }

  private async ensurePlatformAdminRole(): Promise<void> {
    let role = await this.prisma.acpRole.findFirst({
      where: { key: 'platform_admin', tenantId: null },
    });
    if (!role) {
      role = await this.prisma.acpRole.create({
        data: {
          key: 'platform_admin',
          name: 'Platform Administrator',
          description: 'Full platform access via ACP',
          isSystem: true,
        },
      });
    }

    const perms = await this.prisma.acpPermission.findMany();
    for (const p of perms) {
      await this.prisma.acpRolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: p.id },
        },
        create: { roleId: role.id, permissionId: p.id },
        update: {},
      });
    }
  }

  /** Grant platform_admin ACP role to JWT SUPER_ADMIN / ADMIN users. */
  private async assignPlatformAdminToLegacyAdmins(): Promise<void> {
    const role = await this.prisma.acpRole.findFirst({
      where: { key: 'platform_admin', tenantId: null },
    });
    if (!role) return;

    const admins = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] } },
      select: { id: true },
    });

    for (const user of admins) {
      await this.ensureUserRoleAssignment(user.id, role.id, null);
    }
  }

  /**
   * Prisma composite unique `userId_roleId_tenantId` cannot be used in upsert when
   * tenantId is null — use findFirst + create instead.
   */
  private async ensureUserRoleAssignment(
    userId: number,
    roleId: string,
    tenantId: string | null,
  ): Promise<void> {
    const existing = await this.prisma.acpUserRole.findFirst({
      where: { userId, roleId, tenantId },
    });
    if (existing) return;

    await this.prisma.acpUserRole.create({
      data: { userId, roleId, tenantId },
    });
  }
}
