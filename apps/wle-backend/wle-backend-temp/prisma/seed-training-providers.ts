import {
  InstructorQualificationStatus,
  PrismaClient,
  ProviderApprovalStatus,
  ProviderComplianceLevel,
  UserRole,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";

type SeedCtx = {
  prisma: PrismaClient;
  passwordHash: string;
  adminUserId: number;
  certificationByName: Map<string, { id: number; name: string }>;
  workerIds: number[];
};

type CourseSeed = {
  code: string;
  name: string;
  certificationName: string;
  validityDays: number;
  durationHours: number;
  contentText: string;
  standards: { standardKey: string; title: string }[];
};

type ProviderSeed = {
  code: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  approvalStatus: ProviderApprovalStatus;
  compliance: { status: ProviderComplianceLevel; score: number; gaps?: string[] };
  bio: string;
  admin: { username: string; email: string };
  instructor: { username: string; email: string; firstName: string; lastName: string };
  courses: CourseSeed[];
  issueTrainingForWorkers?: number;
};

const PRACTICE_PROVIDERS: ProviderSeed[] = [
  {
    code: "RU-SAFE",
    name: "RU Safe Training",
    email: "info@rusafe.demo",
    phone: "+1-780-555-0101",
    website: "https://rusafe.demo",
    address: "124 Industrial Ave, Edmonton, AB",
    approvalStatus: ProviderApprovalStatus.APPROVED,
    compliance: { status: ProviderComplianceLevel.COMPLIANT, score: 92 },
    bio: "Fall protection, rescue, and confined-space training for industrial and construction crews across Western Canada.",
    admin: { username: "rusafe_admin", email: "rusafe_admin@vera.com" },
    instructor: {
      username: "rusafe_inst",
      email: "rusafe_instructor@vera.com",
      firstName: "Jordan",
      lastName: "Reeves",
    },
    courses: [
      {
        code: "FALL-L1",
        name: "Fall Protection Level 1",
        certificationName: "Fall Protection Level 1",
        validityDays: 1095,
        durationHours: 8,
        contentText:
          "CSA Z259 fall protection fundamentals, harness inspection, anchor selection, and work-at-height procedures.",
        standards: [
          { standardKey: "CSA-Z259", title: "CSA Z259 — Fall protection" },
          { standardKey: "ANSI-Z359", title: "ANSI Z359 — Fall protection code" },
        ],
      },
      {
        code: "CONFINED-ENTRY",
        name: "Confined Space Entry & Monitor",
        certificationName: "Fall Protection Level 1",
        validityDays: 1095,
        durationHours: 16,
        contentText:
          "Permit-required confined space entry, atmospheric monitoring, rescue planning, and attendant responsibilities.",
        standards: [{ standardKey: "CSA-Z1006", title: "CSA Z1006 — Management of work in confined spaces" }],
      },
    ],
    issueTrainingForWorkers: 4,
  },
  {
    code: "TRANSCARE",
    name: "TransCare Medical & Safety",
    email: "training@transcare.demo",
    phone: "+1-403-555-0202",
    website: "https://transcare.demo",
    address: "88 Health Park Dr, Calgary, AB",
    approvalStatus: ProviderApprovalStatus.APPROVED,
    compliance: { status: ProviderComplianceLevel.COMPLIANT, score: 88 },
    bio: "First aid, medical response, and driver safety programs for logistics and field operations.",
    admin: { username: "transcare_admin", email: "transcare_admin@vera.com" },
    instructor: {
      username: "transcare_inst",
      email: "transcare_instructor@vera.com",
      firstName: "Morgan",
      lastName: "Ellis",
    },
    courses: [
      {
        code: "FA-L3",
        name: "Standard First Aid — Level 3",
        certificationName: "Fall Protection Level 1",
        validityDays: 1095,
        durationHours: 16,
        contentText: "Emergency first aid, CPR, and workplace medical response aligned to provincial requirements.",
        standards: [{ standardKey: "CSA-Z1210", title: "CSA Z1210 — First aid training" }],
      },
    ],
    issueTrainingForWorkers: 3,
  },
  {
    code: "ARMOUR",
    name: "Armour Safety Services",
    email: "register@armour.demo",
    phone: "+1-587-555-0303",
    website: "https://armour.demo",
    address: "2200 Gateway Blvd, Red Deer, AB",
    approvalStatus: ProviderApprovalStatus.PENDING,
    compliance: {
      status: ProviderComplianceLevel.PENDING_REVIEW,
      score: 72,
      gaps: ["Provider not approved", "1 active course(s) missing standards"],
    },
    bio: "Equipment operator and site safety courses — approval review in progress for VERA marketplace listing.",
    admin: { username: "armour_admin", email: "armour_admin@vera.com" },
    instructor: {
      username: "armour_inst",
      email: "armour_instructor@vera.com",
      firstName: "Alex",
      lastName: "Nguyen",
    },
    courses: [
      {
        code: "LIFT-OP",
        name: "Aerial Lift Operator",
        certificationName: "Aerial Lift Operator",
        validityDays: 1095,
        durationHours: 8,
        contentText: "Boom and scissor lift operation, pre-use inspection, and elevated work platform safety.",
        standards: [{ standardKey: "ANSI-A92", title: "ANSI A92 — MEWP safe use" }],
      },
      {
        code: "ROUGH-TERRAIN",
        name: "Rough Terrain Forklift",
        certificationName: "Aerial Lift Operator",
        validityDays: 1095,
        durationHours: 6,
        contentText: "Rough terrain forklift operation — standards mapping pending provider approval.",
        standards: [],
      },
    ],
    issueTrainingForWorkers: 0,
  },
  {
    code: "SHARA",
    name: "SharaLife Occupational Health",
    email: "compliance@sharalife.demo",
    phone: "+1-306-555-0404",
    website: "https://sharalife.demo",
    address: "15 Wellness Way, Saskatoon, SK",
    approvalStatus: ProviderApprovalStatus.REJECTED,
    compliance: {
      status: ProviderComplianceLevel.NON_COMPLIANT,
      score: 48,
      gaps: ["Provider not approved", "2 instructor(s) with expired qualifications"],
    },
    bio: "Occupational health programs — application rejected pending updated instructor credentials.",
    admin: { username: "shara_admin", email: "shara_admin@vera.com" },
    instructor: {
      username: "shara_inst",
      email: "shara_instructor@vera.com",
      firstName: "Priya",
      lastName: "Sharma",
    },
    courses: [
      {
        code: "WHMIS-GHS",
        name: "WHMIS / GHS Awareness",
        certificationName: "Fall Protection Level 1",
        validityDays: 365,
        durationHours: 4,
        contentText: "Hazard communication, SDS literacy, and workplace chemical safety.",
        standards: [{ standardKey: "WHMIS", title: "WHMIS 2015 — Workplace hazardous materials" }],
      },
    ],
    issueTrainingForWorkers: 0,
  },
];

async function ensureUser(
  prisma: PrismaClient,
  passwordHash: string,
  data: {
    username: string;
    email: string;
    role: UserRole;
    trainingProviderId?: number;
  },
) {
  return prisma.user.upsert({
    where: { username: data.username },
    update: {
      email: data.email,
      password: passwordHash,
      role: data.role,
      trainingProviderId: data.trainingProviderId ?? null,
    },
    create: {
      username: data.username,
      email: data.email,
      password: passwordHash,
      role: data.role,
      trainingProviderId: data.trainingProviderId ?? null,
    },
  });
}

async function seedOneProvider(ctx: SeedCtx, def: ProviderSeed) {
  const { prisma, passwordHash, adminUserId, certificationByName, workerIds } = ctx;
  const qrToken = `tp_${def.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${randomBytes(6).toString("hex")}`;

  const provider = await prisma.trainingProvider.upsert({
    where: { code: def.code },
    update: {
      name: def.name,
      email: def.email,
      phone: def.phone,
      website: def.website,
      address: def.address,
      approvalStatus: def.approvalStatus,
      active: true,
    },
    create: {
      name: def.name,
      code: def.code,
      email: def.email,
      phone: def.phone,
      website: def.website,
      address: def.address,
      qrToken,
      approvalStatus: def.approvalStatus,
      active: true,
    },
  });

  await prisma.providerProfile.upsert({
    where: { trainingProviderId: provider.id },
    update: {
      displayName: def.name,
      bio: def.bio,
      websiteUrl: def.website,
    },
    create: {
      trainingProviderId: provider.id,
      displayName: def.name,
      bio: def.bio,
      websiteUrl: def.website,
    },
  });

  const existingApproval = await prisma.providerApproval.findFirst({
    where: { providerId: provider.id, status: def.approvalStatus },
    orderBy: { createdAt: "desc" },
  });
  if (!existingApproval) {
    await prisma.providerApproval.create({
      data: {
        providerId: provider.id,
        status: def.approvalStatus,
        reviewedBy:
          def.approvalStatus !== ProviderApprovalStatus.PENDING ? adminUserId : undefined,
        notes:
          def.approvalStatus === ProviderApprovalStatus.PENDING
            ? "Submitted for VERA marketplace review (seed)."
            : def.approvalStatus === ProviderApprovalStatus.REJECTED
              ? "Instructor credentials expired — re-submit when renewed (seed)."
              : "Approved for demo / practice use (seed).",
      },
    });
  }

  const latestCompliance = await prisma.providerComplianceStatus.findFirst({
    where: { providerId: provider.id },
    orderBy: { assessedAt: "desc" },
  });
  if (!latestCompliance) {
    await prisma.providerComplianceStatus.create({
      data: {
        providerId: provider.id,
        status: def.compliance.status,
        score: def.compliance.score,
        gaps: def.compliance.gaps ?? [],
        notes: "Initial practice provider assessment (seed).",
      },
    });
  }

  const adminUser = await ensureUser(prisma, passwordHash, {
    ...def.admin,
    role: UserRole.TRAINING_PROVIDER_ADMIN,
    trainingProviderId: provider.id,
  });

  const instructorUser = await ensureUser(prisma, passwordHash, {
    ...def.instructor,
    role: UserRole.TRAINING_INSTRUCTOR,
  });

  const qualificationExpiresAt =
    def.approvalStatus === ProviderApprovalStatus.REJECTED
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 400 * 24 * 60 * 60 * 1000);

  const instructor = await prisma.trainingInstructor.upsert({
    where: { userId: instructorUser.id },
    update: {
      providerId: provider.id,
      firstName: def.instructor.firstName,
      lastName: def.instructor.lastName,
      email: def.instructor.email,
      licenseNumber: `${def.code}-INST-001`,
      qualifiedCourseCodes: def.courses.map((c) => c.code),
      qualificationExpiresAt,
      qualificationStatus:
        def.approvalStatus === ProviderApprovalStatus.REJECTED
          ? InstructorQualificationStatus.EXPIRED
          : InstructorQualificationStatus.ACTIVE,
      active: true,
    },
    create: {
      providerId: provider.id,
      firstName: def.instructor.firstName,
      lastName: def.instructor.lastName,
      email: def.instructor.email,
      licenseNumber: `${def.code}-INST-001`,
      qualifiedCourseCodes: def.courses.map((c) => c.code),
      qualificationExpiresAt,
      qualificationStatus:
        def.approvalStatus === ProviderApprovalStatus.REJECTED
          ? InstructorQualificationStatus.EXPIRED
          : InstructorQualificationStatus.ACTIVE,
      userId: instructorUser.id,
      active: true,
    },
  });

  const courseIds: number[] = [];
  for (const courseDef of def.courses) {
    const cert = certificationByName.get(courseDef.certificationName);
    const course = await prisma.trainingCourse.upsert({
      where: {
        providerId_code: { providerId: provider.id, code: courseDef.code },
      },
      update: {
        name: courseDef.name,
        description: courseDef.name,
        certificationId: cert?.id,
        validityDays: courseDef.validityDays,
        durationHours: courseDef.durationHours,
        contentText: courseDef.contentText,
        active: true,
      },
      create: {
        providerId: provider.id,
        code: courseDef.code,
        name: courseDef.name,
        description: courseDef.name,
        certificationId: cert?.id,
        validityDays: courseDef.validityDays,
        durationHours: courseDef.durationHours,
        contentText: courseDef.contentText,
        active: true,
      },
    });
    courseIds.push(course.id);

    await prisma.trainingCourse.update({
      where: { id: course.id },
      data: {
        instructors: { set: [{ id: instructor.id }] },
      },
    });

    for (const std of courseDef.standards) {
      const existingStd = await prisma.trainingCourseStandard.findFirst({
        where: { courseId: course.id, standardKey: std.standardKey },
      });
      if (!existingStd) {
        await prisma.trainingCourseStandard.create({
          data: {
            courseId: course.id,
            standardKey: std.standardKey,
            title: std.title,
            required: true,
          },
        });
      }
    }
  }

  if (
    def.issueTrainingForWorkers &&
    def.issueTrainingForWorkers > 0 &&
    def.approvalStatus === ProviderApprovalStatus.APPROVED &&
    courseIds.length > 0
  ) {
    const slice = workerIds.slice(0, def.issueTrainingForWorkers);
    for (let i = 0; i < slice.length; i++) {
      const workerId = slice[i];
      const courseId = courseIds[i % courseIds.length];
      const course = await prisma.trainingCourse.findUnique({ where: { id: courseId } });
      if (!course?.certificationId) continue;

      const existing = await prisma.trainingRecord.findFirst({
        where: {
          workerId,
          trainingProviderId: provider.id,
          courseId,
        },
      });
      if (existing) continue;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (course.validityDays ?? 1095));

      await prisma.trainingRecord.create({
        data: {
          workerId,
          certificationId: course.certificationId,
          trainingProviderId: provider.id,
          courseId,
          instructorId: instructor.id,
          certificateNumber: `${def.code}-${workerId}-${course.code}`,
          certificateQrToken: `cert_${def.code.toLowerCase()}_${workerId}_${randomBytes(4).toString("hex")}`,
          expiresAt,
          issuedAt: new Date(Date.now() - (30 + i) * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  return { provider, adminUser, instructorUser };
}

export async function seedTrainingProviders(ctx: SeedCtx) {
  console.log("  → Practice training providers (portal, courses, approvals)…");

  const results = [];
  for (const def of PRACTICE_PROVIDERS) {
    results.push(await seedOneProvider(ctx, def));
  }

  console.log("  ✓ Training providers seeded:");
  for (const { provider, adminUser, instructorUser } of results) {
    console.log(
      `      · ${provider.name} (${provider.approvalStatus}) — admin: ${adminUser.email} | instructor: ${instructorUser.email}`,
    );
  }
  console.log(
    `    Login password for all practice accounts: ${process.env.SEED_USER_PASSWORD ?? "hashedpassword123"}`,
  );
  console.log("    Provider portal: http://localhost:3000/provider-portal");
  console.log("    Public profiles: http://localhost:3000/providers/<id>");
}
