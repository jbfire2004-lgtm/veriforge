import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * Fail fast when the integration DB is behind `schema.prisma` (common after a partial migrate).
 */
export async function assertPhase1DbSchema(
  prisma: PrismaService,
): Promise<void> {
  try {
    await prisma.$queryRawUnsafe(
      'SELECT "completedAt" FROM "TrainingRecord" LIMIT 1',
    );
  } catch {
    throw new Error(
      'Phase 1 tests require an up-to-date database (e.g. TrainingRecord.completedAt). ' +
        'From backend/: run `npx prisma migrate deploy` (or `prisma db push` in dev) against DATABASE_URL.',
    );
  }

  try {
    await prisma.$queryRawUnsafe(
      'SELECT "ingestionRunId" FROM "TrainingRecord" LIMIT 1',
    );
  } catch {
    throw new Error(
      'Phase 1 tests require TrainingRecord.ingestionRunId (training-ingestion linkage). ' +
        'From backend/: run `npx prisma migrate deploy` against DATABASE_URL.',
    );
  }
}
