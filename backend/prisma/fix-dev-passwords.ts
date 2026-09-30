/**
 * One-off / repeatable: bcrypt-hash dev passwords so /auth/login works.
 * Seed used to store plaintext; AuthService validates with bcrypt.compare.
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const DEV_LOGIN_PASSWORD =
  process.env.SEED_USER_PASSWORD ?? "hashedpassword123";

async function main() {
  const passwordHash = await bcrypt.hash(DEV_LOGIN_PASSWORD, 10);
  const emails = ["admin@vera.com", "supervisor1@vera.com", "contractor1@vera.com"];

  for (const email of emails) {
    const result = await prisma.user.updateMany({
      where: { email },
      data: { password: passwordHash },
    });
    console.log(`Updated ${email}: ${result.count} row(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
