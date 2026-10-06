import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AcpService } from '../acp/acp.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  FEATURE_COMPARISON_ROWS,
  PRICING_PLANS,
  SUBSCRIPTION_ADDONS,
  SUBSCRIPTION_MODULES,
  COMPARISON_TIER_KEYS,
  COMPARISON_TIER_LABELS,
  getAddonByKey,
  getPlanByKey,
} from './subscriptions.catalog';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly acp: AcpService,
  ) {}

  getCatalog() {
    return {
      modules: SUBSCRIPTION_MODULES,
      comparison: {
        tierKeys: COMPARISON_TIER_KEYS,
        tierLabels: COMPARISON_TIER_LABELS,
        rows: FEATURE_COMPARISON_ROWS,
      },
      plans: PRICING_PLANS,
      addons: SUBSCRIPTION_ADDONS,
    };
  }

  async listTiers() {
    const tiers = await this.acp.listTiers();
    return tiers.map((t) => ({
      id: t.id,
      key: t.key,
      name: t.name,
      description: t.description,
      sortOrder: t.sortOrder,
      limitsJson: t.limitsJson,
      featuresJson: t.featuresJson,
      plan: PRICING_PLANS.find((p) => p.acpTierKey === t.key) ?? null,
    }));
  }

  async listFeatures() {
    const flags = await this.acp.listFeatureFlags();
    return flags.map((f) => ({
      id: f.id,
      key: f.key,
      name: f.name,
      description: f.description,
      module: f.module,
      defaultEnabled: f.defaultEnabled,
      requiredTierKey: f.requiredTierKey,
      addon:
        SUBSCRIPTION_ADDONS.find((a) => a.featureKeys.includes(f.key)) ?? null,
    }));
  }

  async getCurrentSubscription(userId: number) {
    const tenantId = await this.resolveTenantIdForUser(userId);
    if (!tenantId) return { tenantId: null, subscription: null, features: [] };

    const tenant = await this.acp.getTenant(tenantId);
    const flags = await this.prisma.acpTenantFeatureFlag.findMany({
      where: { tenantId, enabled: true },
      include: { featureFlag: true },
    });

    return {
      tenantId,
      subscription: tenant.subscription ?? null,
      features: flags.map((f) => f.featureFlag.key),
    };
  }

  async purchaseSubscription(
    userId: number,
    body: { planKey: string; addonKeys?: string[] },
  ) {
    const plan = getPlanByKey(body.planKey);
    if (!plan) throw new BadRequestException(`Unknown plan: ${body.planKey}`);

    const tenantId = await this.ensureTenantForUser(userId);
    const tier = await this.prisma.acpSubscriptionTier.findUnique({
      where: { key: plan.acpTierKey },
    });
    if (!tier) {
      throw new NotFoundException(
        `ACP tier "${plan.acpTierKey}" not seeded — restart API or run migrations`,
      );
    }

    await this.acp.assignTenantSubscription(
      tenantId,
      tier.id,
      undefined,
      userId,
    );

    const featureKeys = new Set<string>(plan.featureKeys);
    for (const addonKey of body.addonKeys ?? []) {
      const addon = getAddonByKey(addonKey);
      if (!addon) throw new BadRequestException(`Unknown add-on: ${addonKey}`);
      for (const k of addon.featureKeys) featureKeys.add(k);
    }

    await this.applyFeatureKeys(tenantId, [...featureKeys], userId);

    return {
      ok: true,
      tenantId,
      planKey: plan.key,
      tierKey: tier.key,
      addonKeys: body.addonKeys ?? [],
      redirectUrl: '/welcome',
    };
  }

  async purchaseAddons(userId: number, body: { addonKeys: string[] }) {
    if (!body.addonKeys?.length) {
      throw new BadRequestException('addonKeys required');
    }

    const tenantId = await this.ensureTenantForUser(userId);
    const featureKeys = new Set<string>();

    for (const addonKey of body.addonKeys) {
      const addon = getAddonByKey(addonKey);
      if (!addon) throw new BadRequestException(`Unknown add-on: ${addonKey}`);
      for (const k of addon.featureKeys) featureKeys.add(k);
    }

    await this.applyFeatureKeys(tenantId, [...featureKeys], userId);

    return {
      ok: true,
      tenantId,
      addonKeys: body.addonKeys,
      redirectUrl: '/welcome',
    };
  }

  private async applyFeatureKeys(
    tenantId: string,
    featureKeys: string[],
    actorId: number,
  ) {
    const flags = await this.prisma.acpFeatureFlag.findMany({
      where: { key: { in: featureKeys } },
    });

    for (const key of featureKeys) {
      const flag = flags.find((f) => f.key === key);
      if (!flag) continue;
      await this.acp.setTenantFeatureFlag(tenantId, flag.id, true, actorId);
    }
  }

  private async resolveTenantIdForUser(userId: number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        acpTenantId: true,
        companyId: true,
        company: { select: { name: true } },
      },
    });
    if (!user) return null;
    if (user.acpTenantId) return user.acpTenantId;

    if (user.companyId) {
      const existing = await this.prisma.acpTenant.findUnique({
        where: { companyId: user.companyId },
      });
      return existing?.id ?? null;
    }
    return null;
  }

  private async ensureTenantForUser(userId: number): Promise<string> {
    const existing = await this.resolveTenantIdForUser(userId);
    if (existing) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { acpTenantId: existing },
      });
      return existing;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const canPurchase =
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN ||
      user.role === UserRole.COMPANY_ADMIN;
    if (!canPurchase) {
      throw new ForbiddenException(
        'Only company admins can purchase subscriptions',
      );
    }

    const slugBase =
      user.company?.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40) || `user-${user.id}`;
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const tenant = await this.acp.createTenant(
      {
        slug,
        name: user.company?.name ?? `${user.username} Organization`,
        companyId: user.companyId ?? undefined,
      },
      userId,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { acpTenantId: tenant.id },
    });

    return tenant.id;
  }
}
