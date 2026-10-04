import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedPracticeCompany } from "./seed-practice-company";

async function run() {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  try {
    await seedPracticeCompany(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
