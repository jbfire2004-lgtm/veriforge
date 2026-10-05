import type { Company, Certification, Worker } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';

export type Phase1Seed = {
  tag: string;
  company: Company;
  certification: Certification;
  worker: Worker;
  cleanup: () => Promise<void>;
};

/**
 * Minimal company + worker + certification for ingestion / verification flows.
 */
export async function seedPhase1Minimal(
  prisma: PrismaService,
): Promise<Phase1Seed> {
  const tag = `p1_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const company = await prisma.company.create({
    data: { name: `Phase1 Company ${tag}` },
  });
  const certification = await prisma.certification.create({
    data: { name: `Phase1 Cert ${tag}`, code: tag },
  });
  const worker = await prisma.worker.create({
    data: {
      firstName: 'Phase1',
      lastName: 'Worker',
      companyId: company.id,
    },
  });

  const cleanup = async () => {
    await prisma.trainingAttestation.deleteMany({
      where: { trainingRecord: { workerId: worker.id } },
    });
    await prisma.trainingRecord.deleteMany({ where: { workerId: worker.id } });
    await prisma.trainingIngestionRun.deleteMany({
      where: { companyId: company.id },
    });
    await prisma.worker.deleteMany({ where: { id: worker.id } });
    await prisma.certification.deleteMany({ where: { id: certification.id } });
    await prisma.company.deleteMany({ where: { id: company.id } });
  };

  return { tag, company, certification, worker, cleanup };
}
