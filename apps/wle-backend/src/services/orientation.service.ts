import { LifecycleState, OrientationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

const DAY_MS = 86_400_000;

export class OrientationService {
  async completeOrientation(workerId: string, date: Date) {
    return prisma.worker.update({
      where: { id: workerId },
      data: {
        orientationStatus: OrientationStatus.valid,
        orientationDate: date,
        lifecycleState: LifecycleState.active,
      },
      include: {
        certifications: true,
      },
    });
  }

  async expireOrientation(workerId: string) {
    return prisma.worker.update({
      where: { id: workerId },
      data: {
        orientationStatus: OrientationStatus.expired,
        lifecycleState: LifecycleState.expired,
      },
      include: {
        certifications: true,
      },
    });
  }

  async autoExpireOrientations(orientationExpiryDays: number) {
    const cutoff = new Date(Date.now() - orientationExpiryDays * DAY_MS);

    const workersToExpire = await prisma.worker.findMany({
      where: {
        orientationStatus: OrientationStatus.valid,
        orientationDate: {
          lt: cutoff,
        },
      },
      select: {
        id: true,
      },
    });

    let expiredCount = 0;
    for (const worker of workersToExpire) {
      await this.expireOrientation(worker.id);
      expiredCount += 1;
    }

    return {
      checked: workersToExpire.length,
      expiredCount,
      cutoff,
    };
  }
}
