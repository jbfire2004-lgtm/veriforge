import { Prisma, type BillingCycle, type ModuleCode, type OrgStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { slugify } from '../utils/crypto';

function mapOrg(o: {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  industry: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  subscriptionProfile: Prisma.JsonValue | null;
  modulesEnabled: Prisma.JsonValue;
  trialStart: Date | null;
  trialEnd: Date | null;
  isTrialActive: boolean;
  externalCustomerId: string | null;
  billingEmail: string | null;
  defaultBillingCycle: BillingCycle;
  timezone: string;
  onboardingNotes: string | null;
  onboardingChecklist: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    status: o.status,
    industry: o.industry,
    address: o.address,
    contactEmail: o.contactEmail,
    contactPhone: o.contactPhone,
    subscriptionProfile: o.subscriptionProfile ?? {},
    modulesEnabled: Array.isArray(o.modulesEnabled) ? o.modulesEnabled : [],
    trialStart: o.trialStart,
    trialEnd: o.trialEnd,
    isTrialActive: o.isTrialActive,
    externalCustomerId: o.externalCustomerId,
    billingEmail: o.billingEmail,
    defaultBillingCycle: o.defaultBillingCycle,
    timezone: o.timezone,
    onboardingNotes: o.onboardingNotes,
    onboardingChecklist: o.onboardingChecklist,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export class OrganizationService {
  async getById(orgId: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundError('Organization not found');
    return mapOrg(org);
  }

  async update(
    orgId: string,
    patch: {
      name?: string;
      status?: OrgStatus;
      billingCycle?: BillingCycle;
      billingEmail?: string;
      timezone?: string;
      onboardingNotes?: string | null;
      onboardingChecklist?: Record<string, boolean> | null;
    },
  ) {
    if (patch.name !== undefined && patch.name.trim().length < 2) {
      throw new BadRequestError('Organization name is too short');
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        name: patch.name?.trim(),
        status: patch.status,
        defaultBillingCycle: patch.billingCycle,
        billingEmail: patch.billingEmail,
        timezone: patch.timezone,
        ...(patch.onboardingNotes !== undefined
          ? { onboardingNotes: patch.onboardingNotes }
          : {}),
        ...(patch.onboardingChecklist !== undefined
          ? {
              onboardingChecklist:
                patch.onboardingChecklist === null
                  ? Prisma.DbNull
                  : patch.onboardingChecklist,
            }
          : {}),
      },
    });

    if (patch.billingCycle) {
      await prisma.subscription.updateMany({
        where: {
          orgId,
          status: { in: ['trialing', 'active', 'past_due', 'paused'] },
        },
        data: { billingCycle: patch.billingCycle },
      });
    }

    return mapOrg(org);
  }

  async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let slug = base;
    let i = 0;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      i += 1;
      slug = `${base}-${i}`;
    }
    return slug;
  }

  async list(params: {
    status?: OrgStatus;
    trialOnly?: boolean;
    lifecycle?: 'trial' | 'active' | 'suspended';
    moduleCode?: ModuleCode;
    moduleEnabled?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.OrganizationWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.trialOnly || params.lifecycle === 'trial' ? { isTrialActive: true } : {}),
      ...(params.lifecycle === 'suspended' ? { status: 'suspended' } : {}),
      ...(params.lifecycle === 'active'
        ? {
            isTrialActive: false,
            status: 'active',
            subscriptions: { some: { status: { in: ['active', 'past_due'] } } },
          }
        : {}),
      ...(params.moduleCode
        ? {
            organizationModules: {
              some: {
                effectiveTo: null,
                enabled: params.moduleEnabled ?? true,
                module: { code: params.moduleCode },
              },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip ?? 0,
        take: Math.min(params.take ?? 50, 200),
        include: {
          subscriptions: {
            where: { status: { in: ['trialing', 'active', 'past_due', 'paused'] } },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          organizationModules: {
            where: { effectiveTo: null },
            include: { module: true },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return {
      items: items.map((o) => ({
        ...mapOrg(o),
        modules: o.organizationModules,
        subscription: o.subscriptions[0] ?? null,
      })),
      total,
    };
  }
}

export const organizationService = new OrganizationService();
