/**
 * Vera Core reference seed — idempotent upserts for workers, training, wallet,
 * union hall, notifications, RBAC, API keys, and offline sync fixtures.
 *
 * Run: npx ts-node -P tsconfig.prisma.json prisma/seed-vera-core.ts
 */
import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  ProjectStatus,
  AssignmentStatus,
  ProviderApprovalStatus,
  UnionMembershipStatus,
  UnionHallTrainingStatus,
  RegulatoryComplianceStatus,
  TrainingCredentialNftMintStatus,
  NotificationStatus,
  TrainingValidationSubject,
  TrainingValidationOutcome,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const DEV_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'hashedpassword123';

const CORE_COMPANY = 'Vera Core Demo Energy';
const CORE_PROJECT = 'CORE-DEMO-01';
const UNION_HALL_NAME = 'IBEW Local 424';
const PROVIDER_NAME = 'Northern Safety Training Co.';
const CERT_FALL_PROTECTION = 'Fall Protection';
const CERT_FIRST_AID = 'Standard First Aid';

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

async function main() {
  console.log('🌱 Seeding Vera Core reference data…');
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  const company =
    (await prisma.company.findFirst({ where: { name: CORE_COMPANY } })) ??
    (await prisma.company.create({
      data: {
        name: CORE_COMPANY,
        city: 'Calgary',
        province: 'AB',
        industry: 'Energy',
      },
    }));

  const adminUser = await prisma.user.upsert({
    where: { username: 'core_admin' },
    update: { password: passwordHash, role: UserRole.COMPANY_ADMIN, companyId: company.id },
    create: {
      username: 'core_admin',
      email: 'core_admin@vera.com',
      password: passwordHash,
      role: UserRole.COMPANY_ADMIN,
      companyId: company.id,
    },
  });

  const workerUser = await prisma.user.upsert({
    where: { username: 'core_worker' },
    update: { password: passwordHash, role: UserRole.WORKER, companyId: company.id },
    create: {
      username: 'core_worker',
      email: 'core_worker@vera.com',
      password: passwordHash,
      role: UserRole.WORKER,
      companyId: company.id,
    },
  });

  const worker = await prisma.worker.upsert({
    where: { userId: workerUser.id },
    update: { companyId: company.id, firstName: 'Jordan', lastName: 'Klein' },
    create: {
      firstName: 'Jordan',
      lastName: 'Klein',
      companyId: company.id,
      userId: workerUser.id,
      email: 'core_worker@vera.com',
      qrToken: `wqr-${randomBytes(8).toString('hex')}`,
    },
  });

  const companyLink = await prisma.companyLink.findFirst({
    where: { workerId: worker.id, companyId: company.id },
  });
  if (!companyLink) {
    await prisma.companyLink.create({
      data: {
        workerId: worker.id,
        companyId: company.id,
        active: true,
        role: 'Journeyman Electrician',
        trade: 'Electrical',
      },
    });
  }

  const site =
    (await prisma.site.findFirst({ where: { name: 'Core Demo North Pad' } })) ??
    (await prisma.site.create({
      data: {
        name: 'Core Demo North Pad',
        code: 'CORE-NORTH',
        latitude: 51.05,
        longitude: -114.07,
      },
    }));

  const project = await prisma.project.findFirst({
    where: { companyId: company.id, code: CORE_PROJECT },
  }).then(
    async (p) =>
      p ??
      prisma.project.create({
        data: {
          companyId: company.id,
          siteId: site.id,
          name: 'Core Demo Project',
          code: CORE_PROJECT,
          status: ProjectStatus.ACTIVE,
        },
      }),
  );

  const assignment = await prisma.projectAssignment.findFirst({
    where: { workerId: worker.id, projectId: project.id, status: AssignmentStatus.ACTIVE },
  });
  if (!assignment) {
    await prisma.projectAssignment.create({
      data: {
        workerId: worker.id,
        projectId: project.id,
        companyId: company.id,
        assignedBy: adminUser.id,
        status: AssignmentStatus.ACTIVE,
      },
    });
  }

  const certFall = await prisma.certification.findFirst({ where: { name: CERT_FALL_PROTECTION } }).then(
    async (c) => c ?? prisma.certification.create({ data: { name: CERT_FALL_PROTECTION, code: 'FP-001' } }),
  );
  const certAid = await prisma.certification.findFirst({ where: { name: CERT_FIRST_AID } }).then(
    async (c) => c ?? prisma.certification.create({ data: { name: CERT_FIRST_AID, code: 'FA-001' } }),
  );

  const provider = await prisma.trainingProvider.findFirst({ where: { name: PROVIDER_NAME } }).then(
    async (p) =>
      p ??
      prisma.trainingProvider.create({
        data: {
          name: PROVIDER_NAME,
          code: 'NST-424',
          approvalStatus: ProviderApprovalStatus.APPROVED,
          email: 'dispatch@northernsafety.example',
        },
      }),
  );

  await prisma.providerSyncConfig.upsert({
    where: { providerId: provider.id },
    update: { enabled: true, syncMode: 'poll', pollIntervalMinutes: 30 },
    create: {
      providerId: provider.id,
      syncMode: 'poll',
      pollUrl: 'https://api.northernsafety.example/v1/completions',
      pollIntervalMinutes: 30,
      apiKeyEnvVar: 'NORTHERN_SAFETY_API_KEY',
      enabled: true,
    },
  });

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const trainingRecord = await prisma.trainingRecord.findFirst({
    where: { workerId: worker.id, certificationId: certFall.id },
  }).then(
    async (r) =>
      r ??
      prisma.trainingRecord.create({
        data: {
          workerId: worker.id,
          certificationId: certFall.id,
          trainingProviderId: provider.id,
          companyId: company.id,
          projectId: project.id,
          issuedAt: new Date(),
          expiresAt,
          completedAt: new Date(),
          lastVerificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          certificateNumber: 'NST-FP-2026-0042',
        },
      }),
  );

  const existingRun = await prisma.trainingVerificationRun.findFirst({
    where: { trainingRecordId: trainingRecord.id, overallStatus: 'VERIFIED' },
  });
  if (!existingRun) {
    await prisma.trainingVerificationRun.create({
      data: {
        trainingRecordId: trainingRecord.id,
        overallStatus: 'VERIFIED',
        authenticityStatus: 'AUTHENTIC',
        regulatoryStatus: 'COMPLIANT',
        standardsOutcome: 'PASS',
        jurisdictionCode: 'AB',
        checks: { provider: 'approved', expiry: 'valid', signature: 'present' },
        propagation: { wallet: { synced: true }, nft: { scheduled: true } },
        actorId: adminUser.id,
      },
    });
  }

  const validation =
    (await prisma.trainingValidationResult.findFirst({
      where: { trainingRecordId: trainingRecord.id, outcome: TrainingValidationOutcome.APPROVED },
    })) ??
    (await prisma.trainingValidationResult.create({
      data: {
        subjectType: TrainingValidationSubject.TRAINING_RECORD,
        outcome: TrainingValidationOutcome.APPROVED,
        score: 98,
        jurisdictionCode: 'AB',
        matchedStandardCodes: ['CSA-Z259.2.5'],
        trainingRecordId: trainingRecord.id,
        trainingProviderId: provider.id,
        validatedBy: adminUser.id,
      },
    }));

  const regulatory =
    (await prisma.regulatoryVerificationDecision.findFirst({
      where: { trainingRecordId: trainingRecord.id },
    })) ??
    (await prisma.regulatoryVerificationDecision.create({
      data: {
        trainingRecordId: trainingRecord.id,
        regulatoryComplianceStatus: RegulatoryComplianceStatus.COMPLIANT,
        complianceScore: 98,
        jurisdictionCode: 'AB',
        matchedStandards: ['CSA-Z259.2.5'],
        jurisdictionCoverage: ['AB', 'BC'],
        reasons: [],
        validationResultId: validation.id,
        recommendedAction: 'ACCEPT',
        decisionHash: sha256(`decision-${trainingRecord.id}`),
      },
    }));

  await prisma.workerWalletItem.upsert({
    where: { trainingRecordId: trainingRecord.id },
    update: { status: 'ACTIVE', catalogTypeKey: 'fall_protection' },
    create: {
      workerId: worker.id,
      companyId: company.id,
      trainingRecordId: trainingRecord.id,
      catalogTypeKey: 'fall_protection',
      status: 'ACTIVE',
      notes: 'Verified fall protection credential',
    },
  });

  const bundlePayload = {
    workerId: worker.id,
    credentials: [{ trainingRecordId: trainingRecord.id, status: 'VERIFIED' }],
    generatedAt: new Date().toISOString(),
  };
  const bundleHash = sha256(JSON.stringify(bundlePayload));

  await prisma.workerWalletBundle.upsert({
    where: { workerId_version: { workerId: worker.id, version: 1 } },
    update: { bundleHash, payload: bundlePayload, syncedAt: new Date() },
    create: {
      workerId: worker.id,
      companyId: company.id,
      version: 1,
      bundleHash,
      qrPayload: `vera://wallet/${worker.id}?v=1&h=${bundleHash.slice(0, 16)}`,
      payload: bundlePayload,
      deviceId: 'seed-device-001',
    },
  });

  await prisma.trainingCredentialNft.upsert({
    where: { trainingRecordId: trainingRecord.id },
    update: { mintStatus: TrainingCredentialNftMintStatus.MINTED, nftTokenId: 'vera-nft-4242' },
    create: {
      trainingRecordId: trainingRecord.id,
      workerId: worker.id,
      regulatoryVerificationDecisionId: regulatory.id,
      mintStatus: TrainingCredentialNftMintStatus.MINTED,
      nftTokenId: 'vera-nft-4242',
      chain: 'vera-stub',
      regulatoryDecisionHash: regulatory.decisionHash ?? bundleHash,
      mintedAt: new Date(),
    },
  });

  const existingCredential = await prisma.credential.findFirst({
    where: { workerId: worker.id, certificationId: certFall.id },
  });
  if (!existingCredential) {
    await prisma.credential.create({
      data: {
        workerId: worker.id,
        name: CERT_FALL_PROTECTION,
        value: 'VERIFIED',
        certificationId: certFall.id,
        expiresAt,
      },
    });
  }

  const unionHall = await prisma.unionHall.findFirst({ where: { name: UNION_HALL_NAME } }).then(
    async (h) =>
      h ??
      prisma.unionHall.create({
        data: { name: UNION_HALL_NAME, localNumber: '424', region: 'Southern Alberta' },
      }),
  );

  await prisma.unionMembership.upsert({
    where: { unionHallId_workerId: { unionHallId: unionHall.id, workerId: worker.id } },
    update: { status: UnionMembershipStatus.ACTIVE, memberNumber: '424-1188' },
    create: {
      unionHallId: unionHall.id,
      workerId: worker.id,
      memberNumber: '424-1188',
      status: UnionMembershipStatus.ACTIVE,
    },
  });

  await prisma.unionHallProviderLink.upsert({
    where: {
      unionHallId_trainingProviderId: {
        unionHallId: unionHall.id,
        trainingProviderId: provider.id,
      },
    },
    update: { active: true },
    create: {
      unionHallId: unionHall.id,
      trainingProviderId: provider.id,
      active: true,
    },
  });

  await prisma.unionHallTrainingReceipt.upsert({
    where: {
      unionHallId_trainingRecordId: {
        unionHallId: unionHall.id,
        trainingRecordId: trainingRecord.id,
      },
    },
    update: {
      status: UnionHallTrainingStatus.PUSHED,
      pushedAt: new Date(),
      pushedCompanyId: company.id,
      pushedProjectId: project.id,
    },
    create: {
      unionHallId: unionHall.id,
      trainingRecordId: trainingRecord.id,
      status: UnionHallTrainingStatus.PUSHED,
      acceptedAt: new Date(),
      acceptedByUserId: adminUser.id,
      validatedAt: new Date(),
      pushedAt: new Date(),
      pushedCompanyId: company.id,
      pushedProjectId: project.id,
    },
  });

  const tenant = await prisma.acpTenant.upsert({
    where: { slug: 'vera-core-demo' },
    update: { name: CORE_COMPANY, companyId: company.id },
    create: {
      slug: 'vera-core-demo',
      name: CORE_COMPANY,
      companyId: company.id,
    },
  });

  const role = await prisma.acpRole.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: 'company_admin' } },
    update: { name: 'Company Administrator' },
    create: {
      tenantId: tenant.id,
      key: 'company_admin',
      name: 'Company Administrator',
      description: 'Full Vera Core access for company tenant',
    },
  });

  const permissions = [
    { key: 'core.workers.read', module: 'core', action: 'read' },
    { key: 'core.workers.write', module: 'core', action: 'write' },
    { key: 'core.training.verify', module: 'core', action: 'verify' },
    { key: 'core.wallet.read', module: 'core', action: 'read' },
    { key: 'core.events.read', module: 'core', action: 'read' },
  ];

  for (const perm of permissions) {
    const row = await prisma.acpPermission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
    await prisma.acpRolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: row.id } },
      update: {},
      create: { roleId: role.id, permissionId: row.id },
    });
  }

  await prisma.acpUserRole.upsert({
    where: { userId_roleId_tenantId: { userId: adminUser.id, roleId: role.id, tenantId: tenant.id } },
    update: {},
    create: { userId: adminUser.id, roleId: role.id, tenantId: tenant.id },
  });

  const rawApiKey = `vk_${randomBytes(24).toString('hex')}`;
  const keyHash = sha256(rawApiKey);
  const keyPrefix = rawApiKey.slice(0, 12);

  await prisma.veraApiKey.upsert({
    where: { keyHash },
    update: { active: true },
    create: {
      name: 'Core Demo Integration Key',
      keyHash,
      keyPrefix,
      companyId: company.id,
      scopes: ['read', 'write', 'wallet', 'events'],
      createdById: adminUser.id,
    },
  });

  const notifKey = `seed-training-verified-${trainingRecord.id}`;
  const existingNotif = await prisma.notification.findFirst({ where: { dedupeKey: notifKey } });
  if (!existingNotif) {
    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: 'TRAINING_VERIFIED',
        title: 'Training verified',
        body: `${worker.firstName} ${worker.lastName} — ${CERT_FALL_PROTECTION} verified`,
        payload: { trainingRecordId: trainingRecord.id, workerId: worker.id },
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        dedupeKey: notifKey,
      },
    });
  }

  await prisma.userNotificationPreference.upsert({
    where: { userId: adminUser.id },
    update: { competencyExpiry: true, assignmentAlerts: true },
    create: { userId: adminUser.id },
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      tenantId: company.id,
      action: 'training.verified',
      entityType: 'training_record',
      entityId: String(trainingRecord.id),
      metadataJson: { workerId: worker.id, certification: CERT_FALL_PROTECTION },
    },
  });

  const existingOutbox = await prisma.eventOutbox.findFirst({
    where: {
      eventName: 'training.verified',
      partitionKey: `company:${company.id}`,
    },
  });
  if (!existingOutbox) {
    await prisma.eventOutbox.create({
      data: {
        eventName: 'training.verified',
        topic: 'vera.training',
        natsSubject: 'vera.training.training_verified',
        partitionKey: `company:${company.id}`,
        payload: {
          name: 'training.verified',
          occurredAt: new Date().toISOString(),
          companyId: company.id,
          entityType: 'training_record',
          entityId: trainingRecord.id,
          data: { workerId: worker.id },
        },
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  const existingBatch = await prisma.coreOfflineSyncBatch.findFirst({
    where: { deviceId: 'seed-device-001', moduleType: 'wallet', status: 'COMPLETED' },
  });
  const offlineBatch = existingBatch ?? (await prisma.coreOfflineSyncBatch.create({
    data: {
      deviceId: 'seed-device-001',
      workerId: worker.id,
      companyId: company.id,
      moduleType: 'wallet',
      status: 'COMPLETED',
      itemCount: 1,
      payload: { items: [{ type: 'wallet_bundle', version: 1 }] },
      submittedById: workerUser.id,
      processedAt: new Date(),
    },
  }));

  const existingConflict = await prisma.coreOfflineSyncConflict.findFirst({
    where: { batchId: offlineBatch.id, recordKey: `worker:${worker.id}:bundle` },
  });
  if (!existingConflict) {
    await prisma.coreOfflineSyncConflict.create({
    data: {
      batchId: offlineBatch.id,
      deviceId: 'seed-device-001',
      moduleType: 'wallet',
      recordKey: `worker:${worker.id}:bundle`,
      localValue: { version: 1 },
      serverValue: { version: 1 },
      resolvedValue: { version: 1 },
      resolvedById: adminUser.id,
      resolvedAt: new Date(),
      },
    });
  }

  const aidRecord = await prisma.trainingRecord.findFirst({
    where: { workerId: worker.id, certificationId: certAid.id },
  }).then(
    async (r) =>
      r ??
      prisma.trainingRecord.create({
        data: {
          workerId: worker.id,
          certificationId: certAid.id,
          companyId: company.id,
          issuedAt: new Date(),
          expiresAt,
          lastVerificationStatus: 'ATTENTION',
        },
      }),
  );

  console.log('✅ Vera Core seed complete');
  console.log(`   Company: ${company.name} (id=${company.id})`);
  console.log(`   Project: ${project.name} (id=${project.id})`);
  console.log(`   Worker: ${worker.firstName} ${worker.lastName} (id=${worker.id})`);
  console.log(`   Verified training: record #${trainingRecord.id}`);
  console.log(`   Attention training: record #${aidRecord.id}`);
  console.log(`   Union hall: ${unionHall.name}`);
  console.log(`   API key (dev only): ${rawApiKey}`);
  console.log(`   Logins: core_admin / core_worker — password: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
