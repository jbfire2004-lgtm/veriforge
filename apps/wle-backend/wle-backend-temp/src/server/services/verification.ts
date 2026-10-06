import { prisma } from '../db';

export type WorkerVerificationStatus = {
  workerId: number;
  isCompliant: boolean;
  issues: {
    type: 'MISSING' | 'EXPIRED' | 'EXPIRING_SOON' | 'NO_DOCUMENT';
    courseName: string;
    expiresAt: Date | null;
  }[];
};

const EXPIRING_SOON_DAYS = 30;

export async function evaluateWorker(
  workerId: number,
): Promise<WorkerVerificationStatus> {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      company: { include: { trainingRequirements: true } },
      trainingRecords: { include: { certification: true } },
      documents: {
        where: { type: 'TRAINING' },
      },
    },
  });

  if (!worker || !worker.company) {
    return { workerId, isCompliant: false, issues: [] };
  }

  const now = new Date();
  const issues: WorkerVerificationStatus['issues'] = [];

  for (const req of worker.company.trainingRequirements) {
    const record = worker.trainingRecords.find(
      (r) =>
        r.certification.name.toLowerCase() === req.courseName.toLowerCase(),
    );

    const doc = worker.documents.find(
      (d) =>
        d.name.toLowerCase().includes(req.courseName.toLowerCase()) ||
        d.name.toLowerCase().includes('training') ||
        d.name.toLowerCase().includes('certificate'),
    );

    if (!record) {
      issues.push({
        type: 'MISSING',
        courseName: req.courseName,
        expiresAt: null,
      });
      if (!doc) {
        issues.push({
          type: 'NO_DOCUMENT',
          courseName: req.courseName,
          expiresAt: null,
        });
      }
      continue;
    }

    if (record.expiresAt && record.expiresAt < now) {
      issues.push({
        type: 'EXPIRED',
        courseName: req.courseName,
        expiresAt: record.expiresAt,
      });
    }

    if (record.expiresAt) {
      const diffDays = (record.expiresAt.getTime() - now.getTime()) / 86400000;
      if (diffDays <= EXPIRING_SOON_DAYS && diffDays > 0) {
        issues.push({
          type: 'EXPIRING_SOON',
          courseName: req.courseName,
          expiresAt: record.expiresAt,
        });
      }
    }

    if (!doc) {
      issues.push({
        type: 'NO_DOCUMENT',
        courseName: req.courseName,
        expiresAt: record.expiresAt ?? null,
      });
    }
  }

  const blockingIssues = issues.filter(
    (i) =>
      i.type === 'MISSING' || i.type === 'EXPIRED' || i.type === 'NO_DOCUMENT',
  );

  return {
    workerId,
    isCompliant: blockingIssues.length === 0,
    issues,
  };
}
