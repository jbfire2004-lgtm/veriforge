import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HUB_MODULE_GATES } from './acp.constants';
import { VERA_MODULE_CATALOG } from './acp-module-catalog';

export type AcpAccessContext = {
  userId: number;
  tenantId: string | null;
  legacyRole: string;
  permissions: string[];
  features: string[];
  subscriptionTierKey: string | null;
  subscriptionStatus: string | null;
  isPlatformAdmin: boolean;
};

export type AcpAccessCheckInput = {
  userId: number;
  permission?: string;
  feature?: string;
  module?: string;
  minTier?: string;
};

const TIER_RANK: Record<string, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  professional: 3,
  pm: 4,
  predictive: 5,
  autonomous: 6,
  marketplace: 7,
  command_center: 8,
  global_intelligence: 9,
  enterprise: 10,
};

@Injectable()
export class AcpAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Platform JWT SUPER_ADMIN/ADMIN bypass ACP for bootstrap. */
  isLegacyPlatformAdmin(role: string): boolean {
    return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  }

  async resolveContext(userId: number): Promise<AcpAccessContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        acpTenantId: true,
        acpUserRoles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
        acpTenant: {
          include: {
            subscription: { include: { tier: true } },
            tenantFeatureFlags: { include: { featureFlag: true } },
          },
        },
      },
    });

    if (!user) {
      return {
        userId,
        tenantId: null,
        legacyRole: UserRole.WORKER,
        permissions: [],
        features: [],
        subscriptionTierKey: null,
        subscriptionStatus: null,
        isPlatformAdmin: false,
      };
    }

    const isPlatformAdmin = this.isLegacyPlatformAdmin(user.role);
    const permissionSet = new Set<string>();
    for (const ur of user.acpUserRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.key);
      }
    }
    if (isPlatformAdmin) {
      permissionSet.add('acp.manage');
      permissionSet.add('*');
    }

    const tierKey = user.acpTenant?.subscription?.tier?.key ?? null;
    const tierFeatures =
      (user.acpTenant?.subscription?.tier?.featuresJson as string[] | null) ??
      [];

    const featureSet = new Set<string>();
    const flags = await this.prisma.acpFeatureFlag.findMany();
    for (const flag of flags) {
      const override = user.acpTenant?.tenantFeatureFlags.find(
        (t) => t.featureFlagId === flag.id,
      );
      const enabled = override?.enabled ?? flag.defaultEnabled;
      if (!enabled) continue;
      if (flag.requiredTierKey && tierKey) {
        const req = TIER_RANK[flag.requiredTierKey] ?? 0;
        const cur = TIER_RANK[tierKey] ?? 0;
        if (cur < req) continue;
      }
      featureSet.add(flag.key);
    }
    for (const f of tierFeatures) featureSet.add(f);

    return {
      userId: user.id,
      tenantId: user.acpTenantId,
      legacyRole: user.role,
      permissions: [...permissionSet],
      features: [...featureSet],
      subscriptionTierKey: tierKey,
      subscriptionStatus: user.acpTenant?.subscription?.status ?? null,
      isPlatformAdmin,
    };
  }

  async check(
    input: AcpAccessCheckInput,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const ctx = await this.resolveContext(input.userId);
    if (ctx.isPlatformAdmin) return { allowed: true };

    if (input.permission) {
      const has =
        ctx.permissions.includes('*') ||
        ctx.permissions.includes(input.permission);
      if (!has) {
        return {
          allowed: false,
          reason: `Missing permission: ${input.permission}`,
        };
      }
    }

    if (input.feature) {
      if (!ctx.features.includes(input.feature)) {
        return { allowed: false, reason: `Feature disabled: ${input.feature}` };
      }
    }

    if (input.module) {
      const gate = HUB_MODULE_GATES[input.module];
      if (gate?.permission) {
        const r = await this.check({
          userId: input.userId,
          permission: gate.permission,
        });
        if (!r.allowed) return r;
      }
      if (gate?.feature) {
        const r = await this.check({
          userId: input.userId,
          feature: gate.feature,
        });
        if (!r.allowed) return r;
      }
      const minTier = input.minTier ?? gate?.minTier;
      if (minTier && ctx.subscriptionTierKey) {
        const req = TIER_RANK[minTier] ?? 0;
        const cur = TIER_RANK[ctx.subscriptionTierKey] ?? 0;
        if (cur < req) {
          return {
            allowed: false,
            reason: `Subscription tier ${minTier} required`,
          };
        }
      }
    }

    if (input.minTier && ctx.subscriptionTierKey) {
      const req = TIER_RANK[input.minTier] ?? 0;
      const cur = TIER_RANK[ctx.subscriptionTierKey] ?? 0;
      if (cur < req) {
        return {
          allowed: false,
          reason: `Subscription tier ${input.minTier} required`,
        };
      }
    }

    return { allowed: true };
  }

  async hubModulesForUser(
    userId: number,
  ): Promise<Array<{ moduleId: string; allowed: boolean; reason?: string }>> {
    const ctx = await this.resolveContext(userId);
    return Object.keys(HUB_MODULE_GATES).map((moduleId) => {
      if (ctx.isPlatformAdmin) return { moduleId, allowed: true };
      const gate = HUB_MODULE_GATES[moduleId];
      if (
        gate.permission &&
        !ctx.permissions.includes(gate.permission) &&
        !ctx.permissions.includes('*')
      ) {
        return { moduleId, allowed: false, reason: 'permission' };
      }
      if (gate.feature && !ctx.features.includes(gate.feature)) {
        return { moduleId, allowed: false, reason: 'feature' };
      }
      if (gate.minTier && ctx.subscriptionTierKey) {
        const req = TIER_RANK[gate.minTier] ?? 0;
        const cur = TIER_RANK[ctx.subscriptionTierKey] ?? 0;
        if (cur < req) return { moduleId, allowed: false, reason: 'tier' };
      }
      return { moduleId, allowed: true };
    });
  }

  async getModuleCardsForUser(userId: number) {
    const ctx = await this.resolveContext(userId);
    const hubModules = await this.hubModulesForUser(userId);
    const hubMap = new Map(hubModules.map((m) => [m.moduleId, m.allowed]));

    return VERA_MODULE_CATALOG.map((mod) => {
      const features: string[] = [];
      let allowed = true;
      let reason: 'permission' | 'feature' | 'tier' | undefined;
      const permission = 'permission' in mod ? mod.permission : undefined;
      const feature = 'feature' in mod ? mod.feature : undefined;
      const hubGateId = 'hubGateId' in mod ? mod.hubGateId : undefined;

      if (permission) features.push(permission);
      if (feature) features.push(feature);

      if (ctx.isPlatformAdmin) {
        return {
          key: mod.key,
          title: mod.title,
          description: mod.description,
          href: mod.href,
          allowed: true,
          features,
        };
      }

      if (
        permission &&
        !ctx.permissions.includes(permission) &&
        !ctx.permissions.includes('*')
      ) {
        allowed = false;
        reason = 'permission';
      }
      if (feature && !ctx.features.includes(feature)) {
        allowed = false;
        reason = reason ?? 'feature';
      }
      if (hubGateId && hubMap.get(hubGateId) === false) {
        allowed = false;
        reason = reason ?? 'permission';
      }
      if (mod.key === 'addons') allowed = true;

      return {
        key: mod.key,
        title: mod.title,
        description: mod.description,
        href: mod.href,
        allowed,
        reason,
        features,
      };
    });
  }
}
