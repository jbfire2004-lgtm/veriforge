import type { BillingCycle, ModuleCode, PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/security/password';
import { encryptField } from '../src/security/field-encryption';
import { trialService } from '../src/services/trial.service';
import { pricingService } from '../src/services/pricing.service';
import { moduleService } from '../src/services/module.service';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEV_TRIAL_DAYS = Number(process.env.SEED_DEV_TRIAL_DAYS ?? 90);

type DevAccount = {
  email: string;
  password: string;
  companyName: string;
  fullName: string;
  slug: string;
  modules: ModuleCode[];
  billingCycle: BillingCycle;
};

function devAccounts(): DevAccount[] {
  const password = process.env.SEED_DEV_ADMIN_PASSWORD ?? 'Str0ng!Passw0rd';
  return [
    {
      email: (process.env.SEED_DEV_ADMIN_EMAIL ?? 'admin@veriforge.local').toLowerCase(),
      password,
      companyName: 'VeriForge Platform Admin',
      fullName: 'Platform Admin',
      slug: 'veriforge-platform-admin',
      modules: ['vericore', 'veripm', 'verihub'],
      billingCycle: 'monthly',
    },
  ];
}

function shouldSeedDevUsers(): boolean {
  if (process.env.SEED_DEV_USERS === '0') return false;
  if (process.env.SEED_DEV_USERS === '1') return true;
  return (process.env.NODE_ENV ?? 'development') !== 'production';
}

async function ensureModulesEnabled(
  prisma: PrismaClient,
  orgId: string,
  moduleCodes: ModuleCode[],
) {
  const mods = await prisma.module.findMany({ where: { code: { in: moduleCodes } } });
  const now = new Date();
  for (const mod of mods) {
    const existing = await prisma.organizationModule.findFirst({
      where: { orgId, moduleId: mod.id, effectiveTo: null },
    });
    if (existing) {
      if (!existing.enabled) {
        await prisma.organizationModule.update({
          where: { id: existing.id },
          data: { enabled: true },
        });
      }
      continue;
    }
    await prisma.organizationModule.create({
      data: { orgId, moduleId: mod.id, enabled: true, effectiveFrom: now },
    });
  }
}

async function reactivateDevTrial(
  prisma: PrismaClient,
  orgId: string,
  moduleCodes: ModuleCode[],
  billingCycle: BillingCycle,
) {
  const trialStart = new Date();
  const trialEnd = new Date(trialStart.getTime() + DEV_TRIAL_DAYS * MS_PER_DAY);

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      trialStart,
      trialEnd,
      isTrialActive: true,
      status: 'active',
    },
  });

  await ensureModulesEnabled(prisma, orgId, moduleCodes);

  const live = await prisma.subscription.findFirst({
    where: {
      orgId,
      status: { in: ['trialing', 'active', 'past_due', 'paused'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (live) {
    await prisma.subscription.update({
      where: { id: live.id },
      data: {
        status: 'trialing',
        trialStart,
        trialEnd,
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd,
      },
    });
    await prisma.subscriptionItem.updateMany({
      where: { subscriptionId: live.id },
      data: { status: 'trialing' },
    });
    return { trialStart, trialEnd };
  }

  const quote = await pricingService.quote({ moduleCodes, billingCycle });
  const modules = await moduleService.resolveModules(moduleCodes);
  const unitAmounts: Record<string, number> = {};
  const priceIds: Record<string, string | null> = {};
  for (const line of quote.lineItems) {
    const mod = modules.find((m) => m.code === line.moduleCode)!;
    unitAmounts[mod.id] = line.unitAmountCents;
    priceIds[mod.id] = line.externalPriceId;
  }

  await prisma.$transaction(async (tx) => {
    await trialService.startTrialInTx(tx, {
      orgId,
      billingCycle,
      currency: quote.currency,
      moduleIds: modules.map((m) => m.id),
      unitAmountsByModuleId: unitAmounts,
      externalPriceIds: priceIds,
    });
  });

  return { trialStart, trialEnd };
}

async function createDevAccount(prisma: PrismaClient, account: DevAccount) {
  const passwordHash = await hashPassword(account.password);
  const quote = await pricingService.quote({
    moduleCodes: account.modules,
    billingCycle: account.billingCycle,
  });
  const modules = await moduleService.resolveModules(account.modules);
  const unitAmounts: Record<string, number> = {};
  const priceIds: Record<string, string | null> = {};
  for (const line of quote.lineItems) {
    const mod = modules.find((m) => m.code === line.moduleCode)!;
    unitAmounts[mod.id] = line.unitAmountCents;
    priceIds[mod.id] = line.externalPriceId;
  }

  const ownerRole = await prisma.role.findUnique({ where: { code: 'owner' } });
  if (!ownerRole) throw new Error('System roles are not seeded — run db seed');

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: account.companyName,
        slug: account.slug,
        billingEmail: account.email,
        defaultBillingCycle: account.billingCycle,
        timezone: 'UTC',
        status: 'active',
      },
    });

    const user = await tx.user.create({
      data: {
        orgId: org.id,
        email: account.email,
        fullName: account.fullName,
        fullNameEnc: encryptField(account.fullName),
        passwordHash,
        status: 'active',
        emailVerifiedAt: new Date(),
      },
    });

    await tx.userRole.create({
      data: {
        orgId: org.id,
        userId: user.id,
        roleId: ownerRole.id,
        assignedBy: user.id,
      },
    });

    const now = new Date();
    for (const mod of modules) {
      await tx.organizationModule.create({
        data: {
          orgId: org.id,
          moduleId: mod.id,
          enabled: true,
          effectiveFrom: now,
        },
      });
    }

    await trialService.startTrialInTx(tx, {
      orgId: org.id,
      billingCycle: account.billingCycle,
      currency: quote.currency,
      moduleIds: modules.map((m) => m.id),
      unitAmountsByModuleId: unitAmounts,
      externalPriceIds: priceIds,
    });

    return { orgId: org.id, userId: user.id };
  });

  const trialEnd = new Date(Date.now() + DEV_TRIAL_DAYS * MS_PER_DAY);
  await prisma.organization.update({
    where: { id: result.orgId },
    data: {
      trialEnd,
      isTrialActive: true,
    },
  });

  return { ...result, trialEnd };
}

export async function seedDevUsers(prisma: PrismaClient): Promise<void> {
  if (!shouldSeedDevUsers()) return;

  const seeded: { email: string; password: string; trialEnd: Date; created: boolean }[] = [];

  for (const account of devAccounts()) {
    const existing = await prisma.user.findFirst({
      where: { email: account.email },
    });

    if (existing) {
      const passwordHash = await hashPassword(account.password);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          status: 'active',
          fullName: account.fullName,
        },
      });

      const { trialEnd } = await reactivateDevTrial(
        prisma,
        existing.orgId,
        account.modules,
        account.billingCycle,
      );

      seeded.push({
        email: account.email,
        password: account.password,
        trialEnd,
        created: false,
      });
      continue;
    }

    const bySlug = await prisma.organization.findUnique({ where: { slug: account.slug } });
    if (bySlug) {
      throw new Error(
        `Dev org slug "${account.slug}" exists but user ${account.email} is missing — resolve manually`,
      );
    }

    const created = await createDevAccount(prisma, account);
    seeded.push({
      email: account.email,
      password: account.password,
      trialEnd: created.trialEnd,
      created: true,
    });
  }

  if (seeded.length) {
    console.log('Dev test accounts (no Stripe required while trial is active):');
    for (const row of seeded) {
      console.log(
        `  ${row.created ? 'created' : 'updated'} ${row.email} / ${row.password} — trial until ${row.trialEnd.toISOString().slice(0, 10)}`,
      );
    }
    console.log(
      '  Platform admin access: email must appear in PLATFORM_ADMIN_EMAILS and VITE_PLATFORM_ADMIN_EMAILS',
    );
  }

  if (process.env.SEED_DEV_REFRESH_ALL_TRIALS !== '0') {
    const orgs = await prisma.organization.findMany({ select: { id: true } });
    const modules: ModuleCode[] = ['vericore', 'veripm', 'verihub'];
    for (const org of orgs) {
      await reactivateDevTrial(prisma, org.id, modules, 'monthly');
    }
    if (orgs.length) {
      console.log(`Refreshed active trials for ${orgs.length} organization(s) (local dev only).`);
    }
  }
}
