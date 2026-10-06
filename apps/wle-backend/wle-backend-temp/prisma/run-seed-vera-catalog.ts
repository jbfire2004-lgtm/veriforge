import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedVeraCatalog } from "./seed-vera-catalog";

async function run() {
  const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  try {
    const companies = await prisma.company.findMany({ orderBy: { id: "asc" }, take: 5 });
    if (!companies.length) {
      throw new Error("No company found — run the main seed first (npm run seed).");
    }
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const result = await seedVeraCatalog(prisma, {
      companyIds: companies.map((c) => c.id),
      publisherUserId: admin?.id,
    });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
