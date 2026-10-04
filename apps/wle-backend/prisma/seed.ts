import "dotenv/config";
import {
  PrismaClient,
  UserRole,
  WorkerSiteStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { validateSeedEnv } from "../src/config/env";

validateSeedEnv(process.env);

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

/** Plaintext login for seeded dev accounts (matches AuthService bcrypt.compare). */
const DEV_LOGIN_PASSWORD =
  process.env.SEED_USER_PASSWORD ?? "hashedpassword123";

async function ensureCertification(name: string) {
  const existing = await prisma.certification.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.certification.create({ data: { name } });
}

async function ensureCompany(name: string) {
  const existing = await prisma.company.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.company.create({ data: { name } });
}

async function ensureWorker(data: {
  firstName: string;
  lastName: string;
  companyId?: number | null;
}) {
  const companyId = data.companyId ?? null;
  const existing = await prisma.worker.findFirst({
    where: {
      firstName: data.firstName,
      lastName: data.lastName,
      companyId,
    },
  });
  if (existing) return existing;
  return prisma.worker.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      companyId,
    },
  });
}

async function ensureEquipmentBySerial(data: {
  name: string;
  serialNumber: string;
}) {
  const existing = await prisma.equipment.findFirst({
    where: { serialNumber: data.serialNumber },
  });
  if (existing) return existing;
  return prisma.equipment.create({ data });
}

async function main() {
  console.log("🌱 Seeding VERA database (idempotent upserts)…");

  const passwordHash = await bcrypt.hash(DEV_LOGIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@vera.com",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      username: "admin",
      email: "admin@vera.com",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { username: "supervisor1" },
    update: {
      email: "supervisor1@vera.com",
      password: passwordHash,
      role: UserRole.SUPERVISOR,
    },
    create: {
      username: "supervisor1",
      email: "supervisor1@vera.com",
      password: passwordHash,
      role: UserRole.SUPERVISOR,
    },
  });

  const contractor = await prisma.user.upsert({
    where: { username: "contractor1" },
    update: {
      email: "contractor1@vera.com",
      password: passwordHash,
      role: UserRole.CONTRACTOR_USER,
    },
    create: {
      username: "contractor1",
      email: "contractor1@vera.com",
      password: passwordHash,
      role: UserRole.CONTRACTOR_USER,
    },
  });

  const siteDefs = [
    { code: "SEED-NORTH", name: "North Ridge Tower" },
    { code: "SEED-SOUTH", name: "South Pit" },
    { code: "SEED-EAST", name: "East Yard" },
    { code: "SEED-WEST", name: "West Lift Station" },
  ] as const;

  const sites = await Promise.all(
    siteDefs.map((s) =>
      prisma.site.upsert({
        where: { code: s.code },
        update: { name: s.name },
        create: { code: s.code, name: s.name },
      }),
    ),
  );

  const trainingProviderNames = [
    "RU Safe",
    "TransCare",
    "Armour Safety",
    "SharaLife",
  ] as const;
  // Issuers for training records / certificates — not employers (see Worker.companyId).
  await Promise.all(
    trainingProviderNames.map((name) =>
      prisma.provider.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const companyNames = [
    "Summit Construction",
    "IronPeak Civil",
    "Skyline Utilities",
  ] as const;
  const companies = await Promise.all(
    companyNames.map((name) => ensureCompany(name)),
  );

  const pmDemoCompany = companies[0];
  const pmDemoSite = sites[0];
  const projectById = await prisma.project.findUnique({ where: { id: 1 } });
  if (!projectById) {
    try {
      await prisma.project.create({
        data: {
          id: 1,
          companyId: pmDemoCompany.id,
          siteId: pmDemoSite.id,
          name: "Demo PM Project",
          code: "PM-DEMO-1",
        },
      });
      console.log("  ✓ Demo PM project (id=1) for safety forms / VeraPM");
    } catch {
      const created = await prisma.project.create({
        data: {
          companyId: pmDemoCompany.id,
          siteId: pmDemoSite.id,
          name: "Demo PM Project",
          code: "PM-DEMO-1",
        },
      });
      console.log(
        `  ✓ Demo PM project id=${created.id} (PM pages defaulting to projectId=1 may need ?projectId=${created.id})`,
      );
    }
  }

  const workers: Awaited<ReturnType<typeof ensureWorker>>[] = [];
  for (let i = 1; i <= 20; i++) {
    const w = await ensureWorker({
      firstName: `Worker${i}`,
      lastName: "Test",
      companyId: companies[(i - 1) % companies.length].id,
    });
    workers.push(w);
  }

  // Not yet assigned to an employer roster — assign `companyId` in admin to move them on-site.
  for (let i = 0; i < 3; i++) {
    workers.push(
      await ensureWorker({
        firstName: "Unassigned",
        lastName: `Pool${i + 1}`,
        companyId: null,
      }),
    );
  }

  const equipment: Awaited<ReturnType<typeof ensureEquipmentBySerial>>[] = [];
  for (let i = 0; i < 10; i++) {
    const serial = `EQ-${1000 + i}`;
    equipment.push(
      await ensureEquipmentBySerial({
        name: `Equipment ${i + 1}`,
        serialNumber: serial,
      }),
    );
  }

  const certFall = await ensureCertification("Fall Protection Level 1");
  const certLift = await ensureCertification("Aerial Lift Operator");

  const certificationByName = new Map(
    [certFall, certLift].map((c) => [c.name, c] as const),
  );

  const providers = await prisma.provider.findMany({ orderBy: { name: "asc" } });

  for (let i = 0; i < 10; i++) {
    const w = workers[i];
    const certificationId = i % 2 === 0 ? certFall.id : certLift.id;
    const existing = await prisma.trainingRecord.findFirst({
      where: { workerId: w.id, certificationId },
    });
    if (!existing) {
      await prisma.trainingRecord.create({
        data: {
          workerId: w.id,
          certificationId,
          expiresAt: new Date("2027-01-01"),
          ...(providers.length > 0
            ? { providerId: providers[i % providers.length].id }
            : {}),
        },
      });
    }
  }

  await Promise.all(
    equipment.map((eq, i) =>
      prisma.equipmentTrainingRequirement.upsert({
        where: {
          equipmentId_certificationId: {
            equipmentId: eq.id,
            certificationId: i % 2 === 0 ? certFall.id : certLift.id,
          },
        },
        update: {},
        create: {
          equipmentId: eq.id,
          certificationId: i % 2 === 0 ? certFall.id : certLift.id,
        },
      }),
    ),
  );

  for (let i = 0; i < 10; i++) {
    const w = workers[i];
    const eq = equipment[i % equipment.length];
    const site = sites[i % sites.length];
    const existingWa = await prisma.workerAssignment.findFirst({
      where: {
        workerId: w.id,
        equipmentId: eq.id,
        siteId: site.id,
      },
    });
    if (!existingWa) {
      await prisma.workerAssignment.create({
        data: {
          workerId: w.id,
          equipmentId: eq.id,
          companyId: w.companyId,
          siteId: site.id,
        },
      });
    }
  }

  for (let i = 0; i < 10; i++) {
    const w = workers[i];
    const site = sites[i % sites.length];
    await prisma.workerSiteAccess.upsert({
      where: {
        workerId_siteId: { workerId: w.id, siteId: site.id },
      },
      update: { status: WorkerSiteStatus.ALLOWED, approved: false },
      create: {
        workerId: w.id,
        siteId: site.id,
        status: WorkerSiteStatus.ALLOWED,
        approved: false,
      },
    });
  }

  for (let i = 0; i < 10; i++) {
    const w = workers[i];
    const existingAudit = await prisma.auditLog.findFirst({
      where: {
        action: "QR_CODE_GENERATED",
        entityType: "Worker",
        entityId: String(w.id),
      },
    });
    if (!existingAudit) {
      await prisma.auditLog.create({
        data: {
          action: "QR_CODE_GENERATED",
          entityType: "Worker",
          entityId: String(w.id),
          metadataJson: {
            qr: `https://vera.app/scan?worker=${w.id}`,
          },
        },
      });
    }
  }

  for (let i = 0; i < 5; i++) {
    const title = `[SEED] Incident ${i + 1}`;
    const existingInc = await prisma.incident.findFirst({
      where: { title },
    });
    if (!existingInc) {
      await prisma.incident.create({
        data: {
          title,
          description: "Seeded incident",
          severity: "LOW",
          workerId: workers[i].id,
          equipmentId: equipment[i].id,
          companyId: workers[i].companyId,
          siteId: sites[i % sites.length].id,
          createdById: supervisor.id,
        },
      });
    }

    const w = workers[i];
    const ds = await prisma.digitalSignoff.findFirst({
      where: {
        workerId: w.id,
        equipmentId: equipment[i].id,
        supervisorId: supervisor.id,
        notes: "Seeded signoff record",
      },
    });
    if (!ds) {
      await prisma.digitalSignoff.create({
        data: {
          workerId: w.id,
          equipmentId: equipment[i].id,
          supervisorId: supervisor.id,
          siteId: sites[i % sites.length].id,
          checklist: {
            damage: true,
            leaks: true,
            controls: true,
            tires: true,
          },
          supervisorSignature: "data:image/png;base64,TEST",
          notes: "Seeded signoff record",
        },
      });
    }
  }

  const fnCompany = await ensureCompany("Thunder Plains First Nation");
  const fnWorkerDefs = ["Eli Bear", "Maya RunningWolf", "Tara SwiftSky"] as const;
  const fnWorkers: Awaited<ReturnType<typeof ensureWorker>>[] = [];
  for (const fullName of fnWorkerDefs) {
    const [firstName, lastName] = fullName.split(" ");
    fnWorkers.push(
      await ensureWorker({
        firstName,
        lastName,
        companyId: fnCompany.id,
      }),
    );
  }

  const fnEquip = await ensureEquipmentBySerial({
    name: "First Aid Kit - Demo",
    serialNumber: "FA-001",
  });

  const fnSignoff = await prisma.digitalSignoff.findFirst({
    where: {
      workerId: fnWorkers[0].id,
      equipmentId: fnEquip.id,
      notes: "Demo signoff for tomorrow’s training session",
    },
  });
  if (!fnSignoff) {
    await prisma.digitalSignoff.create({
      data: {
        workerId: fnWorkers[0].id,
        equipmentId: fnEquip.id,
        supervisorId: supervisor.id,
        siteId: null,
        checklist: {
          damage: true,
          leaks: true,
          controls: true,
          tires: true,
        },
        supervisorSignature: "data:image/png;base64,DEMO",
        notes: "Demo signoff for tomorrow’s training session",
      },
    });
  }

  const { seedHubHomepage } = await import("./seed-hub");
  const demoCompany = await prisma.company.findFirst();
  await seedHubHomepage(prisma, demoCompany?.id);
  const { seedSafetyBlog } = await import("./seed-safety-blog");
  await seedSafetyBlog(prisma, demoCompany?.id);
  const { seedExpertQa } = await import("./seed-expert-qa");
  await seedExpertQa(prisma, {
    authorUserId: admin.id,
    expertUserId: supervisor.id,
    companyId: demoCompany?.id,
  });
  const { seedJobBoard } = await import("./seed-job-board");
  await seedJobBoard(prisma, demoCompany?.id);
  const { seedSocialHomepage } = await import("./seed-social");
  await seedSocialHomepage(prisma, {
    authorUserId: admin.id,
    companyId: demoCompany?.id,
  });

  const { seedTrainingProviders } = await import("./seed-training-providers");
  await seedTrainingProviders({
    prisma,
    passwordHash,
    adminUserId: admin.id,
    certificationByName,
    workerIds: workers.map((w) => w.id),
  });

  const { seedPracticeCompany } = await import("./seed-practice-company");
  await seedPracticeCompany(prisma);

  const { seedVeraCatalog } = await import("./seed-vera-catalog");
  const catalogResult = await seedVeraCatalog(prisma, {
    companyIds: companies.map((c) => c.id),
    publisherUserId: admin.id,
  });
  console.log(
    "  ✓ Vera catalog seed —",
    `inspectionTemplates +${catalogResult.inspectionTemplates.created}/~${catalogResult.inspectionTemplates.updated},`,
    `checklists +${catalogResult.inspectionChecklists.created},`,
    `hazards +${catalogResult.hazards.created},`,
    `controls +${catalogResult.controls.created},`,
    `permits +${catalogResult.permitTypes.created},`,
    `pmTemplates +${catalogResult.pmInspectionTemplates.created}`,
  );

  console.log(
    `🌱 Seed complete — admin.id=${admin.id} supervisor.id=${supervisor.id} contractor.id=${contractor.id}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
