import type { PrismaService } from '../prisma/prisma.service';

/** Typed access until `npx prisma generate` runs after schema migration. */
export type TrainingVerificationRunRow = {
  id: number;
  trainingRecordId: number;
  overallStatus: string;
  authenticityStatus: string;
  regulatoryStatus: string | null;
  standardsOutcome: string | null;
  jurisdictionCode: string | null;
  checks: unknown;
  propagation: unknown;
  actorId: number | null;
  createdAt: Date;
  trainingRecord?: {
    workerId: number;
    companyId: number | null;
    projectId: number | null;
    verifiedAt: Date | null;
    completedAt: Date | null;
    worker: {
      id: number;
      firstName: string;
      lastName: string;
      companyId: number | null;
    };
    certification: { id: number; name: string; code: string | null };
  };
};

type VerificationRunDelegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<{ id: number }>;
  findFirst: (
    args: Record<string, unknown>,
  ) => Promise<TrainingVerificationRunRow | null>;
  findMany: (
    args: Record<string, unknown>,
  ) => Promise<TrainingVerificationRunRow[]>;
};

export function verificationRunDelegate(
  prisma: PrismaService,
): VerificationRunDelegate {
  return (
    prisma as unknown as { trainingVerificationRun: VerificationRunDelegate }
  ).trainingVerificationRun;
}
