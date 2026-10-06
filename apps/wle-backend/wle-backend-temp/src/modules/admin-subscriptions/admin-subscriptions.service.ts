import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AcpSubscriptionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  bucketByMonth,
  isAtRisk,
  isNearSeatLimit,
  mapFeatureFlagsToModules,
  parseModulesEnabled,
  seatsFromTierLimits,
  tierLabelFromKey,
} from './admin-subscriptions.utils';
import type {
  SubscriptionGrowthDto,
  SubscriptionMapPinDto,
  SubscriptionRowDto,
  SubscriptionSummaryDto,
} from './admin-subscriptions.types';
import { VERA_MODULE_KEYS } from './admin-subscriptions.constants';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private companyInclude = {
    acpTenant: {
      include: {
        subscription: { include: { tier: true } },
        tenantFeatureFlags: { include: { featureFlag: true } },
        users: { where: { active: true }, select: { id: true } },
      },
    },
    companyAnalytics: true,
    users: { where: { active: true }, select: { id: true } },
  } as const;

  async listSubscriptions(): Promise<SubscriptionRowDto[]> {
    const companies = await this.prisma.company.findMany({
      include: this.companyInclude,
      orderBy: { name: 'asc' },
    });

    return companies.map((c) => this.toSubscriptionRow(c));
  }

  async getSummary(): Promise<SubscriptionSummaryDto> {
    const rows = await this.listSubscriptions();
    const totalCompanies = rows.length;
    const totalActiveUsers = rows.reduce((s, r) => s + r.activeUsers, 0);
    const totalSeatsPurchased = rows.reduce((s, r) => s + r.seatsPurchased, 0);
    const totalSeatsUsed = rows.reduce((s, r) => s + r.seatsUsed, 0);

    const adoptionByTier: Record<string, number> = {};
    const adoptionByModule: Record<string, number> = {};
    for (const m of VERA_MODULE_KEYS) adoptionByModule[m] = 0;

    let companiesAtRisk = 0;
    let companiesNearSeatLimit = 0;

    for (const r of rows) {
      adoptionByTier[r.tier] = (adoptionByTier[r.tier] ?? 0) + 1;
      for (const mod of r.modulesEnabled) {
        const k = mod.toLowerCase();
        if (k in adoptionByModule) adoptionByModule[k] += 1;
      }
      if (isNearSeatLimit(r.seatsUsed, r.seatsPurchased))
        companiesNearSeatLimit += 1;
      if (isAtRisk(r.churnRiskScore, r.activeUsers, r.modulesEnabled.length)) {
        companiesAtRisk += 1;
      }
    }

    const topTier = Object.entries(adoptionByTier).sort(
      (a, b) => b[1] - a[1],
    )[0] ?? ['Free', 0];

    const moduleUsage = await this.prisma.companyAnalytics.findMany({
      select: { modulesUsed: true },
    });
    const moduleDelta: Record<string, number> = {};
    for (const a of moduleUsage) {
      const mods = (a.modulesUsed ?? {}) as Record<string, number>;
      for (const [k, v] of Object.entries(mods)) {
        moduleDelta[k] = (moduleDelta[k] ?? 0) + v;
      }
    }
    const fastest = Object.entries(moduleDelta).sort(
      (a, b) => b[1] - a[1],
    )[0] ?? ['core', 0];
    const totalModEvents =
      Object.values(moduleDelta).reduce((a, b) => a + b, 0) || 1;

    return {
      totalCompanies,
      totalActiveUsers,
      totalSeatsPurchased,
      totalSeatsUsed,
      averageSeatsPerCompany:
        totalCompanies > 0
          ? Math.round((totalSeatsPurchased / totalCompanies) * 10) / 10
          : 0,
      topTierAdoption: { tier: topTier[0], count: topTier[1] },
      fastestGrowingModule: {
        module: fastest[0],
        growthPercent: Math.round((fastest[1] / totalModEvents) * 100),
      },
      companiesAtRisk,
      companiesNearSeatLimit,
      adoptionByTier,
      adoptionByModule,
    };
  }

  async getMap(): Promise<SubscriptionMapPinDto[]> {
    const rows = await this.listSubscriptions();
    return rows
      .filter((r) => r.location.lat != null && r.location.lng != null)
      .map((r) => ({
        companyId: r.companyId!,
        companyName: r.companyName,
        lat: r.location.lat!,
        lng: r.location.lng!,
        tier: r.tier,
        seatsUsed: r.seatsUsed,
        seatsPurchased: r.seatsPurchased,
        modulesEnabled: r.modulesEnabled,
        renewalDate: r.renewalDate,
        status: r.status,
      }));
  }

  async getGrowth(): Promise<SubscriptionGrowthDto> {
    const [companies, users, seatEvents] = await Promise.all([
      this.prisma.company.findMany({ select: { createdAt: true } }),
      this.prisma.user.findMany({
        where: { active: true },
        select: { createdAt: true },
      }),
      this.prisma.acpAuditLog.findMany({
        where: {
          action: {
            in: ['subscription.updated', 'subscription.seats_updated'],
          },
        },
        select: { createdAt: true, metadata: true },
        orderBy: { createdAt: 'asc' },
        take: 5000,
      }),
    ]);

    const upgradeDates: Date[] = [];
    for (const e of seatEvents) {
      const meta = e.metadata as Record<string, unknown> | null;
      if (meta?.seatsPurchased != null) upgradeDates.push(e.createdAt);
    }

    return {
      newCompaniesByMonth: bucketByMonth(companies.map((c) => c.createdAt)),
      newUsersByMonth: bucketByMonth(users.map((u) => u.createdAt)),
      seatUpgradesByMonth: bucketByMonth(upgradeDates),
    };
  }

  async updateSubscription(dto: UpdateSubscriptionDto, actorUserId?: number) {
    const company = await this.resolveCompany(dto.companyId, dto.tenantId);
    let tenant = company.acpTenant;

    if (!tenant) {
      tenant = await this.prisma.acpTenant.create({
        data: {
          slug: `company-${company.id}`,
          name: company.name,
          companyId: company.id,
          status: dto.tenantStatus ?? 'ACTIVE',
        },
        include: {
          subscription: { include: { tier: true } },
          tenantFeatureFlags: { include: { featureFlag: true } },
          users: { where: { active: true }, select: { id: true } },
        },
      });
    } else if (dto.tenantStatus) {
      await this.prisma.acpTenant.update({
        where: { id: tenant.id },
        data: { status: dto.tenantStatus },
      });
    }

    const subscription = tenant.subscription;
    if (!subscription) {
      const tier =
        (dto.tierKey
          ? await this.prisma.acpSubscriptionTier.findUnique({
              where: { key: dto.tierKey },
            })
          : null) ??
        (await this.prisma.acpSubscriptionTier.findFirst({
          where: { key: 'basic' },
        }));
      if (!tier)
        throw new BadRequestException('No subscription tier available');
      await this.prisma.acpTenantSubscription.create({
        data: {
          tenantId: tenant.id,
          tierId: tier.id,
          status: dto.status ?? AcpSubscriptionStatus.ACTIVE,
          seatsPurchased:
            dto.seatsPurchased ?? seatsFromTierLimits(tier.limitsJson),
          modulesEnabled: (dto.modulesEnabled ?? []) as Prisma.InputJsonValue,
          renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : null,
        },
      });
    } else {
      const data: Prisma.AcpTenantSubscriptionUpdateInput = {};
      if (dto.status) data.status = dto.status;
      if (dto.seatsPurchased != null) data.seatsPurchased = dto.seatsPurchased;
      if (dto.modulesEnabled) {
        data.modulesEnabled = dto.modulesEnabled as Prisma.InputJsonValue;
      }
      if (dto.renewalDate) data.renewalDate = new Date(dto.renewalDate);
      if (dto.tierKey) {
        const tier = await this.prisma.acpSubscriptionTier.findUnique({
          where: { key: dto.tierKey },
        });
        if (!tier)
          throw new BadRequestException(`Unknown tier: ${dto.tierKey}`);
        data.tier = { connect: { id: tier.id } };
      }
      await this.prisma.acpTenantSubscription.update({
        where: { id: subscription.id },
        data,
      });
    }

    await this.prisma.acpAuditLog.create({
      data: {
        tenantId: tenant.id,
        actorUserId,
        action: 'subscription.updated',
        entityType: 'subscription',
        entityId: subscription?.id,
        metadata: dto as unknown as Prisma.InputJsonValue,
      },
    });

    const refreshed = await this.prisma.company.findUnique({
      where: { id: company.id },
      include: this.companyInclude,
    });
    if (!refreshed) throw new NotFoundException('Company not found');
    return this.toSubscriptionRow(refreshed);
  }

  private async resolveCompany(companyId?: number, tenantId?: string) {
    if (companyId) {
      const c = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: this.companyInclude,
      });
      if (!c) throw new NotFoundException('Company not found');
      return c;
    }
    if (tenantId) {
      const t = await this.prisma.acpTenant.findUnique({
        where: { id: tenantId },
        include: { company: true },
      });
      if (!t?.companyId)
        throw new NotFoundException('Tenant or company not found');
      const c = await this.prisma.company.findUnique({
        where: { id: t.companyId },
        include: this.companyInclude,
      });
      if (!c) throw new NotFoundException('Company not found');
      return c;
    }
    throw new BadRequestException('companyId or tenantId required');
  }

  private toSubscriptionRow(c: {
    id: number;
    name: string;
    city: string | null;
    province: string | null;
    industry?: string | null;
    lat: number | null;
    lng: number | null;
    createdAt: Date;
    acpTenant?: {
      id: string;
      subscription?: {
        id: string;
        status: AcpSubscriptionStatus;
        seatsPurchased?: number;
        modulesEnabled?: unknown;
        renewalDate?: Date | null;
        endsAt?: Date | null;
        tier: { key: string; featuresJson: unknown; limitsJson: unknown };
      } | null;
      tenantFeatureFlags?: Array<{
        featureFlag: { key: string };
        enabled: boolean;
      }>;
      users?: Array<{ id: number }>;
    } | null;
    companyAnalytics?: {
      churnRiskScore: number;
      activeUsers30d: number;
    } | null;
    users?: Array<{ id: number }>;
  }): SubscriptionRowDto {
    const sub = c.acpTenant?.subscription;
    const tierKey = sub?.tier.key ?? 'free';
    const tier = tierLabelFromKey(tierKey);
    const enabledFlags = (c.acpTenant?.tenantFeatureFlags ?? [])
      .filter((f) => f.enabled)
      .map((f) => f.featureFlag.key);
    const modulesEnabled = parseModulesEnabled(
      sub?.modulesEnabled,
      sub?.tier.featuresJson,
    );
    if (modulesEnabled.length === 0 && enabledFlags.length > 0) {
      modulesEnabled.push(...mapFeatureFlagsToModules(enabledFlags));
    }

    const seatsPurchased =
      sub?.seatsPurchased ?? seatsFromTierLimits(sub?.tier.limitsJson, 10);
    const seatsUsed = Math.max(
      c.acpTenant?.users?.length ?? 0,
      c.users?.length ?? 0,
      c.companyAnalytics?.activeUsers30d ?? 0,
    );

    const renewal = sub?.renewalDate ?? sub?.endsAt ?? null;

    return {
      id: sub?.id ?? `company-${c.id}`,
      companyId: c.id,
      companyName: c.name,
      tenantId: c.acpTenant?.id ?? null,
      tier,
      tierKey,
      seatsPurchased,
      seatsUsed,
      modulesEnabled,
      renewalDate: renewal?.toISOString() ?? null,
      status: sub?.status ?? 'TRIAL',
      location: {
        city: c.city,
        province: c.province,
        lat: c.lat,
        lng: c.lng,
      },
      industry: c.industry ?? null,
      activeUsers: seatsUsed,
      churnRiskScore: c.companyAnalytics?.churnRiskScore ?? 0,
      createdAt: c.createdAt.toISOString(),
    };
  }
}
