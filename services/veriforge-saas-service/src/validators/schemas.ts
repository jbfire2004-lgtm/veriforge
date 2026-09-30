import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/, 'lowercase required')
  .regex(/[A-Z]/, 'uppercase required')
  .regex(/[0-9]/, 'digit required')
  .regex(/[^A-Za-z0-9]/, 'symbol required');

export const signupSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  ownerEmail: z.string().trim().email().max(320),
  password: passwordSchema,
  ownerFullName: z.string().trim().min(1).max(200).optional(),
  selectedModules: z
    .array(z.enum(['vericore', 'veripm', 'verihub']))
    .min(1)
    .max(3),
  billingCycle: z.enum(['monthly', 'annual']),
  timezone: z.string().max(64).optional(),
});

export const orgCreateSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  ownerEmail: z.string().trim().email().max(320),
  password: passwordSchema,
  ownerFullName: z.string().trim().min(1).max(200).optional(),
  ownerFirstName: z.string().trim().min(1).max(100).optional(),
  ownerLastName: z.string().trim().min(1).max(100).optional(),
  selectedModules: z
    .array(z.enum(['vericore', 'veripm', 'verihub']))
    .min(1)
    .max(3)
    .optional()
    .default(['verihub']),
  billingCycle: z.enum(['monthly', 'annual']).optional().default('monthly'),
  timezone: z.string().max(64).optional(),
  industry: z.string().trim().max(120).optional(),
  address: z.string().trim().max(500).optional(),
  contactEmail: z.string().trim().email().max(320).optional(),
  contactPhone: z.string().trim().max(40).optional(),
});

export const orgUserCreateSchema = z.object({
  email: z.string().trim().email().max(320),
  fullName: z.string().trim().min(1).max(200).optional(),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  password: passwordSchema.optional(),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
  orgRoleName: z.string().trim().min(1).max(100).optional(),
});

export const orgRoleCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  permissions: z.array(z.string().min(1).max(120)).default([]),
  systemCode: z.enum(['owner', 'admin', 'manager', 'user']).nullable().optional(),
});

export const orgModulesUpdateSchema = z.object({
  modules: z
    .array(
      z.object({
        code: z.enum(['vericore', 'veripm', 'verihub']),
        enabled: z.boolean(),
      }),
    )
    .min(1),
});

export const hiringClientSignupSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(1).max(200),
  contactEmail: z.string().trim().email().max(320),
  contactPhone: z.string().trim().max(40).optional(),
  password: passwordSchema,
  adminFullName: z.string().trim().min(1).max(200).optional(),
});

export const hiringClientLoginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
});

export const hiringClientAwardSchema = z.object({
  projectName: z.string().trim().min(1).max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const developerBootstrapSchema = z.object({
  email: z.string().trim().email().max(320),
  password: passwordSchema,
  role: z.enum(['SystemAdmin', 'ModuleArchitect', 'SupportEngineer', 'BillingAdmin']),
  fullName: z.string().trim().min(1).max(200).optional(),
  bootstrapSecret: z.string().min(1).max(200).optional(),
});

export const developerLoginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
});

export const developerImpersonateSchema = z.object({
  targetOrgId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
});

export const developerModuleCreateSchema = z.object({
  code: z.string().trim().min(2).max(32),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const developerModuleUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const developerFeatureFlagSchema = z.object({
  key: z.string().trim().min(2).max(64),
  description: z.string().trim().max(500).optional(),
  enabled: z.boolean(),
  payload: z.record(z.unknown()).nullable().optional(),
});

export const developerApiKeyCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  scopes: z.array(z.string().min(1).max(80)).optional(),
});

export const developerBillingOverrideSchema = z.object({
  orgId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional(),
  extendTrialDays: z.number().int().min(1).max(90).optional(),
});

export const complianceUploadSchema = z.object({
  type: z.enum(['insurance', 'wcb', 'cor', 'scsa', 'custom']),
  fileUrl: z.string().trim().min(4).max(2000),
  expiryDate: z.string().datetime().or(z.string().min(4)).optional().nullable(),
  label: z.string().trim().max(200).optional(),
});

export const complianceReviewSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  notes: z.string().trim().max(2000).optional(),
});

export const complianceUpdateSchema = z.object({
  type: z.enum(['insurance', 'wcb', 'cor', 'scsa', 'custom']).optional(),
  fileUrl: z.string().trim().min(4).max(2000).optional(),
  expiryDate: z.string().datetime().or(z.string().min(4)).optional().nullable(),
  label: z.string().trim().max(200).optional(),
});

const productModuleCode = z.enum([
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

export const subscriptionModulesUpdateSchema = z.object({
  modules: z
    .array(
      z.object({
        code: productModuleCode,
        enabled: z.boolean(),
      }),
    )
    .min(1),
});

export const subscriptionBillingUpdateSchema = z.object({
  billingPlan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
  billingStatus: z
    .enum(['trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid', 'paused'])
    .optional(),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
  mfaCode: z.string().regex(/^\d{6}$/).optional(),
});

export const inviteSchema = z.object({
  email: z.string().trim().email().max(320),
  fullName: z.string().trim().min(1).max(200),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
});

export const pricingQuoteSchema = z.object({
  modules: z.array(z.enum(['vericore', 'veripm', 'verihub'])).min(1),
  billingCycle: z.enum(['monthly', 'annual']),
  currency: z.string().length(3).optional(),
});
