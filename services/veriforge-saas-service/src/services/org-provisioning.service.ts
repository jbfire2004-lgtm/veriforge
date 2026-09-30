import type { BillingCycle, ModuleCode, Prisma, SystemRoleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, ConflictError } from '../utils/errors';
import { hashPassword } from '../security/password';
import { encryptField } from '../security/field-encryption';
import { organizationService } from './organization.service';
import { pricingService } from './pricing.service';
import { moduleService } from './module.service';
import { trialService } from './trial.service';
import { modulePermissionService } from './rbac.service';
import { userService } from './user.service';
import { auditService } from './audit.service';
import { logger } from '../utils/logger';
import { ROLE_PERMISSION_DEFAULTS } from '../rbac/permission-catalog';
import { defaultModulesFromLegacySelection } from '../subscription/product-modules';
import type { SignupInput, SafeUser } from '../types';

/** Display names for seeded org roles (Worker maps to system code `user`). */
export const DEFAULT_ORG_ROLES: {
  name: string;
  systemCode: SystemRoleCode;
  description: string;
}[] = [
  { name: 'Owner', systemCode: 'owner', description: 'Full organization control' },
  { name: 'Admin', systemCode: 'admin', description: 'Manage users, modules, and settings' },
  { name: 'Manager', systemCode: 'manager', description: 'Operational access across modules' },
  { name: 'Worker', systemCode: 'user', description: 'Day-to-day worker access' },
];

export interface OrgCreateInput extends SignupInput {
  industry?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
}

function deriveFullName(input: OrgCreateInput): string {
  const fromParts = [input.ownerFirstName, input.ownerLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fromParts) return fromParts;
  if (input.ownerFullName?.trim()) return input.ownerFullName.trim();
  return input.companyName.trim();
}

function syncModulesEnabledJson(codes: ModuleCode[]): Prisma.InputJsonValue {
  return codes as unknown as Prisma.InputJsonValue;
}

export class OrgProvisioningService {
  /**
   * Provision org + owner + default OrgRoles + modules + trial + onboarding event.
   * Always ensures `verihub` is among enabled modules.
   */
  async provision(
    input: OrgCreateInput,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<{
    organization: Awaited<ReturnType<typeof organizationService.getById>>;
    user: SafeUser;
    quote: Awaited<ReturnType<typeof pricingService.quote>>;
  }> {
    const email = input.ownerEmail.toLowerCase().trim();
    const selected = [...new Set([...(input.selectedModules ?? []), 'verihub' as ModuleCode])];
    if (!selected.length) {
      throw new BadRequestError('Select at least one module');
    }

    const existing = await userService.findByEmail(email);
    if (existing) throw new ConflictError('Email is already registered');

    const quote = await pricingService.quote({
      moduleCodes: selected,
      billingCycle: input.billingCycle,
    });

    const modules = await moduleService.resolveModules(selected);
    const slug = await organizationService.uniqueSlug(input.companyName);
    const passwordHash = await hashPassword(input.password);
    const fullName = deriveFullName(input);
    const firstName = input.ownerFirstName?.trim() || fullName.split(/\s+/)[0] || null;
    const lastName =
      input.ownerLastName?.trim() ||
      (fullName.includes(' ') ? fullName.split(/\s+/).slice(1).join(' ') : null);
    const contactEmail = (input.contactEmail ?? email).toLowerCase().trim();

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: input.companyName.trim(),
          slug,
          billingEmail: email,
          contactEmail,
          contactPhone: input.contactPhone?.trim() || null,
          industry: input.industry?.trim() || null,
          address: input.address?.trim() || null,
          subscriptionProfile: {},
          modulesEnabled: syncModulesEnabledJson(selected),
          defaultBillingCycle: input.billingCycle,
          timezone: input.timezone ?? 'UTC',
          status: 'active',
        },
      });

      const user = await tx.user.create({
        data: {
          orgId: org.id,
          email,
          fullName,
          firstName,
          lastName,
          fullNameEnc: encryptField(fullName),
          passwordHash,
          status: 'active',
          emailVerifiedAt: new Date(),
        },
      });

      const ownerRole = await tx.role.findUnique({ where: { code: 'owner' } });
      if (!ownerRole) {
        throw new BadRequestError('System roles are not seeded — run db seed');
      }

      await tx.userRole.create({
        data: {
          orgId: org.id,
          userId: user.id,
          roleId: ownerRole.id,
          assignedBy: user.id,
        },
      });

      for (const def of DEFAULT_ORG_ROLES) {
        const orgRole = await tx.orgRole.create({
          data: {
            orgId: org.id,
            name: def.name,
            description: def.description,
            systemCode: def.systemCode,
            permissions: ROLE_PERMISSION_DEFAULTS[def.systemCode] as unknown as Prisma.InputJsonValue,
          },
        });
        if (def.systemCode === 'owner') {
          await tx.orgRoleUser.create({
            data: { orgRoleId: orgRole.id, userId: user.id },
          });
        }
      }

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

      const unitAmounts: Record<string, number> = {};
      const priceIds: Record<string, string | null> = {};
      for (const line of quote.lineItems) {
        const mod = modules.find((m) => m.code === line.moduleCode)!;
        unitAmounts[mod.id] = line.unitAmountCents;
        priceIds[mod.id] = line.externalPriceId;
      }

      await trialService.startTrialInTx(tx, {
        orgId: org.id,
        billingCycle: input.billingCycle as BillingCycle,
        currency: quote.currency,
        moduleIds: modules.map((m) => m.id),
        unitAmountsByModuleId: unitAmounts,
        externalPriceIds: priceIds,
      });

      await tx.onboardingEvent.create({
        data: {
          orgId: org.id,
          type: 'org.provisioned',
          meta: {
            modules: selected,
            ownerEmail: email,
          },
        },
      });

      await tx.subscriptionProfile.create({
        data: {
          orgId: org.id,
          modulesEnabled: defaultModulesFromLegacySelection(selected),
          billingPlan: 'trial',
          billingStatus: 'trialing',
        },
      });

      return { orgId: org.id, userId: user.id };
    });

    await modulePermissionService.syncRolesForEnabledModules(selected);
    await trialService.sendWelcomeAndFounderAlerts(result.orgId).catch((err) => {
      logger.error('signup notification failed', {
        orgId: result.orgId,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    const user = await userService.toSafeUser(result.userId);
    const organization = await organizationService.getById(result.orgId);

    await auditService.log({
      action: 'auth.signup',
      orgId: result.orgId,
      actorId: result.userId,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      meta: { modules: selected, via: 'org.provision' },
    });

    logger.info('org provisioned', {
      orgId: result.orgId,
      userId: result.userId,
      modules: selected,
    });

    return { organization, user, quote };
  }

  async refreshModulesEnabledCache(orgId: string): Promise<ModuleCode[]> {
    const rows = await prisma.organizationModule.findMany({
      where: { orgId, effectiveTo: null, enabled: true },
      include: { module: true },
    });
    const codes = rows.map((r) => r.module.code);
    await prisma.organization.update({
      where: { id: orgId },
      data: { modulesEnabled: syncModulesEnabledJson(codes) },
    });
    return codes;
  }
}

export const orgProvisioningService = new OrgProvisioningService();
