import { z } from 'zod';

export const authorizationField = z.string().min(1);

export const legacyModuleCode = z.enum(['vericore', 'veripm', 'verihub']);

export const productModuleCode = z.enum([
  'core',
  'pm',
  'safety',
  'compliance',
  'wallet',
  'training',
  'audits',
  'investigations',
  'scorecards',
  'hiring_client_tools',
]);

export const artifactType = z.enum(['insurance', 'wcb', 'cor', 'scsa', 'custom']);

export const billingPlan = z.enum(['trial', 'starter', 'professional', 'enterprise']);

export const billingStatus = z.enum([
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
  'paused',
]);

export const billingCycle = z.enum(['monthly', 'annual']);

export const orgRoleCode = z.enum(['owner', 'admin', 'manager', 'user']);

export const developerRole = z.enum([
  'SystemAdmin',
  'ModuleArchitect',
  'SupportEngineer',
  'BillingAdmin',
]);

export const orgCreateInput = z.object({
  companyName: z.string().min(2),
  ownerEmail: z.string().email(),
  password: z.string().min(12),
  ownerFullName: z.string().optional(),
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  selectedModules: z.array(legacyModuleCode).optional(),
  billingCycle: billingCycle.optional(),
  industry: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  timezone: z.string().optional(),
});

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const moduleToggleInput = z.object({
  code: legacyModuleCode,
  enabled: z.boolean(),
});

export const productModuleToggleInput = z.object({
  code: productModuleCode,
  enabled: z.boolean(),
});
