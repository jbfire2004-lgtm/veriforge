import {
  PmCompanyControlType,
  PmCompanyHazardCategory,
  PmCompanyPolicyType,
  PmCompanyTrainingCategory,
  PmCompanyTrainingRoleType,
  PmSafetyWorkflowKind,
  PmSafetyWorkflowStatus,
  PrismaClient,
  ProjectSafetyRoleType,
  ProjectStatus,
  ProviderApprovalStatus,
  UserRole,
  WorkerSiteStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes, randomUUID } from "crypto";
import { SAFETY_FORM_CATALOG } from "../src/forms/definitions/catalog";

const COMPANY_NAME = "Aurora Peak Energy Services";
const COMPANY_CODE = "AURORA-PEAK";
const SITE_CODE = "AURORA-NORTH";
const PROJECT_CODE = "AURORA-PRIME-01";

const PASSWORD_HINT = process.env.SEED_USER_PASSWORD ?? "hashedpassword123";

type LevelSeed = {
  key: string;
  title: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  projectSafetyRole: ProjectSafetyRoleType;
  createWorker?: boolean;
};

const ORG_LEVELS: LevelSeed[] = [
  {
    key: "worker",
    title: "Field Worker",
    firstName: "Sam",
    lastName: "Rivera",
    username: "aurora_worker",
    email: "aurora_worker@vera.com",
    role: UserRole.WORKER,
    projectSafetyRole: ProjectSafetyRoleType.worker,
    createWorker: true,
  },
  {
    key: "foreman",
    title: "Foreman",
    firstName: "Casey",
    lastName: "Brooks",
    username: "aurora_foreman",
    email: "aurora_foreman@vera.com",
    role: UserRole.SUPERVISOR,
    projectSafetyRole: ProjectSafetyRoleType.supervisor,
    createWorker: true,
  },
  {
    key: "supervisor",
    title: "Site Supervisor",
    firstName: "Riley",
    lastName: "Chen",
    username: "aurora_supervisor",
    email: "aurora_supervisor@vera.com",
    role: UserRole.SUPERVISOR,
    projectSafetyRole: ProjectSafetyRoleType.supervisor,
  },
  {
    key: "manager",
    title: "Project Manager",
    firstName: "Jordan",
    lastName: "Hayes",
    username: "aurora_manager",
    email: "aurora_manager@vera.com",
    role: UserRole.PROJECT_MANAGER,
    projectSafetyRole: ProjectSafetyRoleType.supervisor,
  },
  {
    key: "director",
    title: "Safety Director",
    firstName: "Taylor",
    lastName: "Nguyen",
    username: "aurora_director",
    email: "aurora_director@vera.com",
    role: UserRole.PROJECT_MANAGER,
    projectSafetyRole: ProjectSafetyRoleType.company_safety_manager,
  },
  {
    key: "vp",
    title: "VP Operations",
    firstName: "Morgan",
    lastName: "Patel",
    username: "aurora_vp",
    email: "aurora_vp@vera.com",
    role: UserRole.COMPANY_ADMIN,
    projectSafetyRole: ProjectSafetyRoleType.company_safety_manager,
  },
  {
    key: "ceo",
    title: "Chief Executive Officer",
    firstName: "Alex",
    lastName: "Whitmore",
    username: "aurora_ceo",
    email: "aurora_ceo@vera.com",
    role: UserRole.COMPANY_ADMIN,
    projectSafetyRole: ProjectSafetyRoleType.prime_admin,
  },
];

async function ensureUser(
  prisma: PrismaClient,
  passwordHash: string,
  level: LevelSeed,
  companyId: number,
) {
  return prisma.user.upsert({
    where: { username: level.username },
    update: {
      email: level.email,
      password: passwordHash,
      role: level.role,
      companyId,
    },
    create: {
      username: level.username,
      email: level.email,
      password: passwordHash,
      role: level.role,
      companyId,
    },
  });
}

async function seedSafetyFormCatalog(prisma: PrismaClient, companyId: number) {
  for (const def of SAFETY_FORM_CATALOG) {
    await prisma.safetyFormDefinition.upsert({
      where: { id: def.id },
      create: {
        id: def.id,
        name: def.name,
        category: def.category,
        version: def.version,
        definition: def as object,
        companyId: def.id === "pha" ? companyId : null,
      },
      update: {
        name: def.name,
        category: def.category,
        version: def.version,
        definition: def as object,
      },
    });
  }
}

async function linkApprovedProvidersMinimal(prisma: PrismaClient, companyId: number) {
  const providers = await prisma.trainingProvider.findMany({
    where: {
      code: { in: ["RU-SAFE", "TRANSCARE"] },
      approvalStatus: ProviderApprovalStatus.APPROVED,
    },
    include: { courses: { where: { active: true } } },
  });

  for (const p of providers) {
    for (const course of p.courses) {
      const courseName = `${course.name} — ${p.name} (${p.code}/${course.code})`;
      await prisma.trainingRequirement.upsert({
        where: { companyId_courseName: { companyId, courseName } },
        create: { companyId, courseName, expiresInDays: course.validityDays ?? 365 },
        update: { expiresInDays: course.validityDays ?? 365 },
      });
    }
  }

  return providers;
}

async function linkApprovedProviders(
  prisma: PrismaClient,
  companyId: number,
  profileId: string,
) {
  const providers = await linkApprovedProvidersMinimal(prisma, companyId);

  await prisma.pmCompanySafetyProfile.update({
    where: { id: profileId },
    data: {
      trainingMatrixRef: {
        approvedTrainingProviders: providers.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          courses: p.courses.map((c) => ({ id: c.id, code: c.code, name: c.name })),
        })),
        notes:
          "Practice company — workers should complete training through linked approved providers (RU Safe, TransCare).",
      } as object,
    },
  });

  return providers;
}

export async function seedPracticeCompany(prisma: PrismaClient) {
  console.log("  → Practice company with safety program & org hierarchy…");

  const passwordHash = await bcrypt.hash(PASSWORD_HINT, 10);
  const admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });

  let company = await prisma.company.findFirst({ where: { name: COMPANY_NAME } });
  if (!company) {
    company = await prisma.company.create({
      data: { name: COMPANY_NAME },
    });
  }

  const site = await prisma.site.upsert({
    where: { code: SITE_CODE },
    update: { name: "Aurora North Compressor Station", region: "AB", active: true },
    create: {
      code: SITE_CODE,
      name: "Aurora North Compressor Station",
      region: "AB",
      latitude: 53.5461,
      longitude: -113.4938,
      active: true,
    },
  });

  let project = await prisma.project.findFirst({
    where: { companyId: company.id, code: PROJECT_CODE },
  });
  if (!project) {
    try {
      project = await prisma.project.create({
        data: {
          companyId: company.id,
          siteId: site.id,
          name: "Aurora Prime Pipeline Maintenance",
          code: PROJECT_CODE,
          status: ProjectStatus.ACTIVE,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Project"', 'id'), COALESCE((SELECT MAX(id) FROM "Project"), 1))`,
      );
      project = await prisma.project.create({
        data: {
          companyId: company.id,
          siteId: site.id,
          name: "Aurora Prime Pipeline Maintenance",
          code: PROJECT_CODE,
          status: ProjectStatus.ACTIVE,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  try {
    await prisma.projectSafetyPlan.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        requiredDefinitionIds: ["daily-flha", "pha", "site-orientation"],
      },
      update: {
        requiredDefinitionIds: ["daily-flha", "pha", "site-orientation"],
      },
    });
  } catch {
    console.warn("      ⚠ project_safety_plan not available — skipping");
  }

  const usersByKey: Record<string, { id: number; email: string; role: UserRole }> = {};
  const workersByKey: Record<string, { id: number }> = {};

  for (const level of ORG_LEVELS) {
    const user = await ensureUser(prisma, passwordHash, level, company.id);
    usersByKey[level.key] = { id: user.id, email: user.email, role: user.role };

    await prisma.projectSafetyRole.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      create: {
        projectId: project.id,
        userId: user.id,
        companyId: company.id,
        role: level.projectSafetyRole,
      },
      update: { role: level.projectSafetyRole, companyId: company.id },
    });

    if (level.createWorker) {
      const worker = await prisma.worker.upsert({
        where: { userId: user.id },
        update: {
          firstName: level.firstName,
          lastName: level.lastName,
          companyId: company.id,
          email: level.email,
        },
        create: {
          firstName: level.firstName,
          lastName: level.lastName,
          companyId: company.id,
          userId: user.id,
          email: level.email,
          qrToken: `wk_${level.key}_${randomBytes(6).toString("hex")}`,
        },
      });
      workersByKey[level.key] = { id: worker.id };

      const existingLink = await prisma.companyLink.findFirst({
        where: { workerId: worker.id, companyId: company.id },
      });
      if (existingLink) {
        await prisma.companyLink.update({
          where: { id: existingLink.id },
          data: { active: true, role: level.title },
        });
      } else {
        await prisma.companyLink.create({
          data: {
            workerId: worker.id,
            companyId: company.id,
            active: true,
            role: level.title,
            trade: level.key === "worker" ? "Labourer" : "General Foreman",
          },
        });
      }

      const existingAssignment = await prisma.projectAssignment.findFirst({
        where: { workerId: worker.id, projectId: project.id },
      });
      if (existingAssignment) {
        await prisma.projectAssignment.update({
          where: { id: existingAssignment.id },
          data: { status: "ACTIVE" },
        });
      } else {
        await prisma.projectAssignment.create({
          data: {
            workerId: worker.id,
            projectId: project.id,
            companyId: company.id,
            assignedBy: admin?.id,
            status: "ACTIVE",
          },
        });
      }

      await prisma.workerSiteAccess.upsert({
        where: { workerId_siteId: { workerId: worker.id, siteId: site.id } },
        create: {
          workerId: worker.id,
          siteId: site.id,
          status: WorkerSiteStatus.ALLOWED,
          approved: true,
          notes: `${level.title} — practice roster`,
        },
        update: { status: WorkerSiteStatus.ALLOWED, approved: true },
      });
    }
  }

  const certFall =
    (await prisma.certification.findFirst({ where: { name: "Fall Protection Level 1" } })) ??
    (await prisma.certification.create({ data: { name: "Fall Protection Level 1" } }));
  const certLift =
    (await prisma.certification.findFirst({ where: { name: "Aerial Lift Operator" } })) ??
    (await prisma.certification.create({ data: { name: "Aerial Lift Operator" } }));

  let equipment = await prisma.equipment.findFirst({
    where: { serialNumber: "AURORA-LIFT-01" },
  });
  if (!equipment) {
    equipment = await prisma.equipment.create({
      data: {
        name: "Aurora MEWP-01",
        serialNumber: "AURORA-LIFT-01",
        companyId: company.id,
      },
    });
  } else {
    equipment = await prisma.equipment.update({
      where: { id: equipment.id },
      data: { name: "Aurora MEWP-01", companyId: company.id },
    });
  }

  await seedSafetyFormCatalog(prisma, company.id);

  let profile: { id: string } | null = null;
  try {
  const profileId = randomUUID();
  profile = await prisma.pmCompanySafetyProfile.upsert({
    where: { companyId: company.id },
    create: {
      id: profileId,
      companyId: company.id,
      corporateRiskLevel: "medium",
      status: "published",
      publishedAt: new Date(),
      publishedById: admin?.id,
      ppeStandardsJson: ["HARD_HAT", "SAFETY_GLASSES", "HI_VIS", "STEEL_TOE", "GLOVES"],
      enforcementRulesJson: {
        blockAccessWithoutOrientation: true,
        blockAccessWithoutPolicyAck: true,
        requireSupervisorOverrideOnTrainingGap: true,
        syncHazardsToProjects: true,
        practiceCompany: true,
        companyCode: COMPANY_CODE,
      },
      autoGenerated: false,
    },
    update: {
      status: "published",
      publishedAt: new Date(),
      corporateRiskLevel: "medium",
    },
  });

  const hazards = [
    {
      category: PmCompanyHazardCategory.equipment,
      title: "Falls from height — MEWP & scaffolding",
      description: "Work at height during compressor deck maintenance and pipe rack access.",
      severity: 4,
      likelihood: 3,
      sifPotential: true,
    },
    {
      category: PmCompanyHazardCategory.energy,
      title: "Stored pressure — natural gas piping",
      description: "Line breaking and flange work near pressurized systems.",
      severity: 5,
      likelihood: 2,
      sifPotential: true,
    },
    {
      category: PmCompanyHazardCategory.chemical,
      title: "H2S / hydrocarbon atmosphere",
      description: "Potential sour gas exposure during excavation and valve maintenance.",
      severity: 4,
      likelihood: 2,
      sifPotential: false,
    },
  ];

  for (const h of hazards) {
    const clientSyncId = `${COMPANY_CODE}-hazard-${h.title.slice(0, 12).replace(/\s/g, "-").toLowerCase()}`;
    await prisma.pmCompanyHazard.upsert({
      where: { clientSyncId },
      create: {
        id: randomUUID(),
        companyId: company.id,
        profileId: profile.id,
        clientSyncId,
        status: "published",
        publishedAt: new Date(),
        active: true,
        ...h,
      },
      update: { status: "published", active: true, description: h.description },
    });
  }

  const controls = [
    {
      controlType: PmCompanyControlType.engineering,
      title: "100% tie-off above 1.8 m",
      description: "Dual lanyard or SRL required for all elevated work on MEWP and racks.",
    },
    {
      controlType: PmCompanyControlType.administrative,
      title: "Energy isolation permit",
      description: "Zero-energy verification before line break; lockout documented on permit.",
    },
    {
      controlType: PmCompanyControlType.ppe,
      title: "H2S monitor & respiratory plan",
      description: "Personal gas monitor and rescue plan for atmospheric work zones.",
    },
  ];

  for (const c of controls) {
    const clientSyncId = `${COMPANY_CODE}-control-${c.title.slice(0, 12).replace(/\s/g, "-").toLowerCase()}`;
    await prisma.pmCompanyControl.upsert({
      where: { clientSyncId },
      create: {
        id: randomUUID(),
        companyId: company.id,
        profileId: profile.id,
        clientSyncId,
        status: "published",
        publishedAt: new Date(),
        active: true,
        controlStrength: 4,
        ...c,
      },
      update: { status: "published", active: true, description: c.description },
    });
  }

  const matrixRows: Array<{
    roleType: PmCompanyTrainingRoleType;
    category: PmCompanyTrainingCategory;
    trainingCode: string;
    trainingName: string;
    expiresInDays: number;
    autoAssignRules: object;
  }> = [
    {
      roleType: PmCompanyTrainingRoleType.worker,
      category: PmCompanyTrainingCategory.general_safety,
      trainingCode: "ORIENTATION",
      trainingName: "Aurora Peak site orientation",
      expiresInDays: 365,
      autoAssignRules: {},
    },
    {
      roleType: PmCompanyTrainingRoleType.worker,
      category: PmCompanyTrainingCategory.high_risk_work,
      trainingCode: "FALL-L1",
      trainingName: "Fall Protection Level 1 — RU Safe (RU-SAFE)",
      expiresInDays: 1095,
      autoAssignRules: { preferredProviderCode: "RU-SAFE", providerCourseCode: "FALL-L1" },
    },
    {
      roleType: PmCompanyTrainingRoleType.supervisor,
      category: PmCompanyTrainingCategory.general_safety,
      trainingCode: "SUPERVISOR_SAFETY",
      trainingName: "Supervisor safety leadership",
      expiresInDays: 730,
      autoAssignRules: {},
    },
    {
      roleType: PmCompanyTrainingRoleType.equipment_operator,
      category: PmCompanyTrainingCategory.equipment_operation,
      trainingCode: "LIFT-OP",
      trainingName: "Aerial lift operator — Armour (pending) / RU Safe alt",
      expiresInDays: 1095,
      autoAssignRules: { preferredProviderCode: "RU-SAFE" },
    },
    {
      roleType: PmCompanyTrainingRoleType.worker,
      category: PmCompanyTrainingCategory.emergency_response,
      trainingCode: "FA-L3",
      trainingName: "Standard First Aid — TransCare (TRANSCARE)",
      expiresInDays: 1095,
      autoAssignRules: { preferredProviderCode: "TRANSCARE", providerCourseCode: "FA-L3" },
    },
  ];

  for (const row of matrixRows) {
    await prisma.pmCompanyTrainingMatrix.upsert({
      where: {
        companyId_roleType_trainingCode: {
          companyId: company.id,
          roleType: row.roleType,
          trainingCode: row.trainingCode,
        },
      },
      create: {
        id: randomUUID(),
        companyId: company.id,
        profileId: profile.id,
        roleType: row.roleType,
        category: row.category,
        trainingCode: row.trainingCode,
        trainingName: row.trainingName,
        expiresInDays: row.expiresInDays,
        autoAssignRules: row.autoAssignRules,
        status: "published",
        publishedAt: new Date(),
        active: true,
      },
      update: {
        trainingName: row.trainingName,
        autoAssignRules: row.autoAssignRules,
        status: "published",
        active: true,
      },
    });
  }

  const policyClientId = `${COMPANY_CODE}-safety-policy-v1`;
  await prisma.pmCompanyPolicy.upsert({
    where: { clientSyncId: policyClientId },
    create: {
      id: randomUUID(),
      companyId: company.id,
      profileId: profile.id,
      clientSyncId: policyClientId,
      policyType: PmCompanyPolicyType.safety_policy,
      title: "Aurora Peak HSE Management System",
      status: "published",
      publishedAt: new Date(),
      requiresAck: true,
      requiresAckForAccess: true,
    },
    update: { status: "published", title: "Aurora Peak HSE Management System" },
  });

  for (const t of [
    { templateCode: "SITE", zoneType: "general_work" as const, title: "General work", requiresJha: false },
    { templateCode: "HIGH_RISK", zoneType: "high_risk" as const, title: "Pipe rack / MEWP zone", requiresJha: true },
    { templateCode: "CONFINED", zoneType: "confined_space" as const, title: "Valve vault", requiresJha: true },
  ]) {
    await prisma.pmCompanyZoneTemplate.upsert({
      where: { companyId_templateCode: { companyId: company.id, templateCode: t.templateCode } },
      create: {
        id: randomUUID(),
        companyId: company.id,
        profileId: profile.id,
        templateCode: t.templateCode,
        zoneType: t.zoneType,
        title: t.title,
        requiresJha: t.requiresJha,
        highRisk: t.requiresJha,
        requiresFlhaHours: 12,
        status: "published",
        active: true,
      },
      update: { status: "published", active: true, title: t.title },
    });
  }
  } catch (e) {
    console.warn(
      "      ⚠ Company safety profile tables not available — skipping PM company library seed.",
      e instanceof Error ? e.message : e,
    );
  }

  const linkedProviders = profile
    ? await linkApprovedProviders(prisma, company.id, profile.id)
    : await linkApprovedProvidersMinimal(prisma, company.id);

  const ruSafe = linkedProviders.find((p) => p.code === "RU-SAFE");
  const transCare = linkedProviders.find((p) => p.code === "TRANSCARE");
  const worker = workersByKey.worker;
  const foreman = workersByKey.foreman;

  if (worker && ruSafe) {
    const fallCourse = ruSafe.courses.find((c) => c.code === "FALL-L1");
    if (fallCourse) {
      const existing = await prisma.trainingRecord.findFirst({
        where: { workerId: worker.id, courseId: fallCourse.id },
      });
      if (!existing) {
        const instructor = await prisma.trainingInstructor.findFirst({
          where: { providerId: ruSafe.id, active: true },
        });
        await prisma.trainingRecord.create({
          data: {
            workerId: worker.id,
            companyId: company.id,
            projectId: project.id,
            certificationId: certFall.id,
            trainingProviderId: ruSafe.id,
            courseId: fallCourse.id,
            instructorId: instructor?.id,
            certificateNumber: `AURORA-${worker.id}-FALL`,
            certificateQrToken: `cert_aurora_${randomBytes(4).toString("hex")}`,
            expiresAt: new Date(Date.now() + 800 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    if (transCare) {
      const faCourse = transCare.courses.find((c) => c.code === "FA-L3");
      if (faCourse) {
        const existing = await prisma.trainingRecord.findFirst({
          where: { workerId: worker.id, courseId: faCourse.id },
        });
        if (!existing) {
          await prisma.trainingRecord.create({
            data: {
              workerId: worker.id,
              companyId: company.id,
              projectId: project.id,
              certificationId: certFall.id,
              trainingProviderId: transCare.id,
              courseId: faCourse.id,
              certificateNumber: `AURORA-${worker.id}-FA`,
              expiresAt: new Date(Date.now() + 700 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }
  }

  if (foreman && ruSafe) {
    const confined = ruSafe.courses.find((c) => c.code === "CONFINED-ENTRY");
    if (confined) {
      const existing = await prisma.trainingRecord.findFirst({
        where: { workerId: foreman.id, courseId: confined.id },
      });
      if (!existing) {
        await prisma.trainingRecord.create({
          data: {
            workerId: foreman.id,
            companyId: company.id,
            projectId: project.id,
            certificationId: certFall.id,
            trainingProviderId: ruSafe.id,
            courseId: confined.id,
            certificateNumber: `AURORA-${foreman.id}-CS`,
            expiresAt: new Date(Date.now() + 900 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  try {
  const phaExists = await prisma.safetyForm.findFirst({
    where: { companyId: company.id, projectId: project.id, definitionId: "pha" },
  });
  if (!phaExists) {
    await prisma.safetyForm.create({
      data: {
        id: randomUUID(),
        definitionId: "pha",
        definitionVersion: 1,
        status: "SUBMITTED",
        title: "Aurora Prime — Project Hazard Assessment",
        companyId: company.id,
        projectId: project.id,
        siteId: site.id,
        workerId: worker?.id,
        createdById: usersByKey.director?.id,
        submittedById: usersByKey.manager?.id,
        submittedAt: new Date(),
        formData: {
          projectScope: "Compressor station turnaround — pipe rack and MEWP work.",
          energyTypes: ["gravity", "pressure", "atmospheric"],
          residualRisk: "medium",
          sifPotential: true,
        },
        sifFlag: true,
      },
    });
  }

  } catch {
    console.warn("      ⚠ safety_forms not available — skipping sample PHA");
  }

  try {
  const flhaExists = await prisma.pmSafetyWorkflow.findFirst({
    where: {
      companyId: company.id,
      kind: PmSafetyWorkflowKind.FLHA,
      title: "Aurora daily FLHA — seed",
    },
  });
  if (!flhaExists) {
    await prisma.pmSafetyWorkflow.create({
      data: {
        kind: PmSafetyWorkflowKind.FLHA,
        title: "Aurora daily FLHA — seed",
        status: PmSafetyWorkflowStatus.APPROVED,
        companyId: company.id,
        siteId: site.id,
        jobLocation: site.name,
        workDescription: "Valve inspection and pipe rack access",
        hazardSummary: "Fall, pinch points, atmospheric monitoring",
        controlMeasures: "Tie-off, gas monitor, spotter for MEWP",
        workerUserId: usersByKey.worker?.id,
        workerSignedAt: new Date(),
        supervisorUserId: usersByKey.foreman?.id,
        supervisorApprovedAt: new Date(),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  const jhaDraft = await prisma.pmSafetyWorkflow.findFirst({
    where: {
      companyId: company.id,
      kind: PmSafetyWorkflowKind.JHA,
      title: "MEWP pipe rack JHA — draft",
    },
  });
  if (!jhaDraft) {
    await prisma.pmSafetyWorkflow.create({
      data: {
        kind: PmSafetyWorkflowKind.JHA,
        title: "MEWP pipe rack JHA — draft",
        status: PmSafetyWorkflowStatus.DRAFT,
        companyId: company.id,
        siteId: site.id,
        jobLocation: "North rack — grid B",
        workDescription: "MEWP access for flange inspection",
        hazardSummary: "Falls, dropped objects, line of fire",
        controlMeasures: "Exclusion zone, tool tethering, 100% tie-off",
        supervisorUserId: usersByKey.supervisor?.id,
      },
    });
  }
  } catch {
    console.warn("      ⚠ PmSafetyWorkflow not available — skipping FLHA/JHA samples");
  }

  const incidentTitle = "[AURORA] Near miss — dropped hand tool from rack";
  if (!(await prisma.incident.findFirst({ where: { title: incidentTitle, companyId: company.id } }))) {
    await prisma.incident.create({
      data: {
        title: incidentTitle,
        description: "Wrench slipped from belt at height; no injury — practice record.",
        severity: "LOW",
        companyId: company.id,
        siteId: site.id,
        workerId: worker?.id,
        equipmentId: equipment.id,
        createdById: usersByKey.supervisor?.id ?? admin?.id,
      },
    });
  }

  console.log(`  ✓ ${COMPANY_NAME} (id=${company.id})`);
  console.log(`      Project: ${project.name} (id=${project.id}) — use ?projectId=${project.id} in PM URLs`);
  console.log(`      Site: ${site.name} (${SITE_CODE})`);
  console.log(
    `      Linked training providers: ${linkedProviders.map((p) => p.name).join(", ") || "(run seed:training-providers first)"}`,
  );
  console.log("      Practice logins (password: " + PASSWORD_HINT + "):");
  for (const level of ORG_LEVELS) {
    console.log(`        · ${level.title.padEnd(22)} ${level.email}  [${level.role}]`);
  }
  console.log("      Try: /pm?projectId=" + project.id + "  /admin  /supervisor  /wallet (worker)");
}
