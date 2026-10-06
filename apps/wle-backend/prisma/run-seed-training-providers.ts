import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { seedTrainingProviders } from "./seed-training-providers";

async function main(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(
    process.env.SEED_USER_PASSWORD ?? "hashedpassword123",
    10,
  );
  const admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
  const certs = await prisma.certification.findMany();
  const workers = await prisma.worker.findMany({ take: 10, orderBy: { id: "asc" } });
  const certificationByName = new Map(certs.map((c) => [c.name, c] as const));

  await seedTrainingProviders({
    prisma,
    passwordHash,
    adminUserId: admin?.id ?? 1,
    certificationByName,
    workerIds: workers.map((w) => w.id),
  });

  const rows = await prisma.trainingProvider.findMany({
    select: {
      id: true,
      name: true,
      approvalStatus: true,
      _count: { select: { courses: true, instructors: true, trainingRecords: true } },
    },
    orderBy: { name: "asc" },
  });
  console.log(JSON.stringify(rows, null, 2));
}

async function run() {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  try {
    await main(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
