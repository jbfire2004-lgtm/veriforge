import { PrismaClient, type ModuleCode, type SystemRoleCode } from '@prisma/client';
import {
  MODULE_PERMISSION_BUNDLES,
  PERMISSION_CATALOG,
  ROLE_PERMISSION_DEFAULTS,
} from '../src/rbac/permission-catalog';
import { seedDevUsers } from './seed-dev-users';

const prisma = new PrismaClient();

const MODULE_DEFS: {
  code: ModuleCode;
  name: string;
  description: string;
  sortOrder: number;
  monthlyCents: number;
  annualCents: number;
}[] = [
  {
    code: 'vericore',
    name: 'VeriCore',
    description: 'Workforce, credentials, training, and compliance core',
    sortOrder: 1,
    monthlyCents: 29900,
    annualCents: 299000,
  },
  {
    code: 'veripm',
    name: 'VeriPM',
    description: 'Project safety, SMS, field operations',
    sortOrder: 2,
    monthlyCents: 39900,
    annualCents: 399000,
  },
  {
    code: 'verihub',
    name: 'VeriHub',
    description: 'Hub, calculators, and cross-module surfaces',
    sortOrder: 3,
    monthlyCents: 9900,
    annualCents: 99000,
  },
];

const ROLE_DEFS: {
  code: SystemRoleCode;
  name: string;
  description: string;
}[] = [
  {
    code: 'owner',
    name: 'Owner',
    description: 'Full organization control including billing and trial',
  },
  {
    code: 'admin',
    name: 'Admin',
    description: 'Manage users, modules, and most org settings',
  },
  {
    code: 'manager',
    name: 'Manager',
    description: 'Operational access across enabled modules',
  },
  {
    code: 'user',
    name: 'Worker',
    description: 'Read-focused day-to-day worker access',
  },
];

async function main() {
  for (const m of MODULE_DEFS) {
    const mod = await prisma.module.upsert({
      where: { code: m.code },
      create: {
        code: m.code,
        name: m.name,
        description: m.description,
        sortOrder: m.sortOrder,
      },
      update: {
        name: m.name,
        description: m.description,
        sortOrder: m.sortOrder,
        isActive: true,
      },
    });

    for (const cycle of ['monthly', 'annual'] as const) {
      const amount = cycle === 'monthly' ? m.monthlyCents : m.annualCents;
      const existing = await prisma.modulePrice.findFirst({
        where: { moduleId: mod.id, billingCycle: cycle, effectiveTo: null },
      });
      if (!existing) {
        await prisma.modulePrice.create({
          data: {
            moduleId: mod.id,
            billingCycle: cycle,
            unitAmountCents: amount,
            currency: 'USD',
          },
        });
      }
    }
  }

  for (const role of ROLE_DEFS) {
    await prisma.role.upsert({
      where: { code: role.code },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });
  }

  for (const p of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: { key: p.key, name: p.name },
      update: { name: p.name },
    });
  }

  // Hiring-client keys (catalog only — enforced via HiringClientUser.permissions JSON)
  const { HIRING_CLIENT_PERMISSION_CATALOG } = await import(
    '../src/rbac/hiring-client-permissions'
  );
  for (const p of HIRING_CLIENT_PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: { key: p.key, name: p.name },
      update: { name: p.name },
    });
  }

  const { DEVELOPER_PERMISSION_CATALOG } = await import(
    '../src/rbac/developer-permissions'
  );
  for (const p of DEVELOPER_PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: { key: p.key, name: p.name },
      update: { name: p.name },
    });
  }

  const permissions = await prisma.permission.findMany();
  const byKey = Object.fromEntries(permissions.map((p) => [p.key, p.id]));
  const roles = await prisma.role.findMany();
  const roleByCode = Object.fromEntries(roles.map((r) => [r.code, r.id]));

  const modules = await prisma.module.findMany();
  for (const mod of modules) {
    const bundle = MODULE_PERMISSION_BUNDLES[mod.code] ?? [];
    await prisma.modulePermission.createMany({
      data: bundle
        .filter((k) => byKey[k])
        .map((k) => ({ moduleId: mod.id, permissionId: byKey[k]! })),
      skipDuplicates: true,
    });
  }

  for (const [roleCode, keys] of Object.entries(ROLE_PERMISSION_DEFAULTS)) {
    const roleId = roleByCode[roleCode];
    if (!roleId) continue;
    await prisma.rolePermission.createMany({
      data: keys
        .filter((k) => byKey[k])
        .map((k) => ({ roleId, permissionId: byKey[k]! })),
      skipDuplicates: true,
    });
  }

  await prisma.platformSetting.upsert({
    where: { key: 'annual_discount_percent' },
    create: { key: 'annual_discount_percent', value: { percent: 17 } },
    update: {},
  });

  await prisma.schemaRelease.upsert({
    where: { releaseTag: 'v1.0.0-schema' },
    create: {
      releaseTag: 'v1.0.0-schema',
      migrationName: '20260720000000_init',
      notes: 'Initial VeriForge multi-tenant schema + catalog seed',
    },
    update: {
      migrationName: '20260720000000_init',
      notes: 'Initial VeriForge multi-tenant schema + catalog seed',
    },
  });

  console.log('VeriForge seed complete:', {
    modules: MODULE_DEFS.length,
    roles: ROLE_DEFS.length,
    permissions: PERMISSION_CATALOG.length,
  });

  await seedDevUsers(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
