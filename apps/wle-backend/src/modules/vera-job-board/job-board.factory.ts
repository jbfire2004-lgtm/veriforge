import { PrismaClient } from '@prisma/client';
import { JobBoardService } from './job-board.service';
import { JobBoardWorkerService } from './job-board-worker.service';

export function createJobBoardService(prisma: PrismaClient): JobBoardService {
  const workers = new JobBoardWorkerService(prisma as never);
  return new JobBoardService(prisma as never, workers);
}

export function createJobBoardWorkerService(
  prisma: PrismaClient,
): JobBoardWorkerService {
  return new JobBoardWorkerService(prisma as never);
}
