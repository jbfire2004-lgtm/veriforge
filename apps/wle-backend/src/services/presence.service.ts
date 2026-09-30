import { prisma } from "../lib/prisma";

export class PresenceService {
  async registerScan(workerId: string, code: string) {
    const point = await prisma.presencePoint.findUnique({
      where: { code },
    });

    if (!point || !point.active) {
      throw new Error("Presence point not found or inactive");
    }

    const scannedAt = new Date();

    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.presenceLog.create({
        data: {
          workerId,
          presencePointId: point.id,
          scannedAt,
        },
        include: {
          presencePoint: true,
        },
      });

      await tx.worker.update({
        where: { id: workerId },
        data: { lastHeartbeat: scannedAt },
      });

      return created;
    });

    return {
      success: true,
      pointName: log.presencePoint.name,
      scannedAt: log.scannedAt,
      logId: log.id,
    };
  }

  async getWorkerPresence(workerId: string) {
    return prisma.presenceLog.findMany({
      where: { workerId },
      include: {
        presencePoint: true,
      },
      orderBy: { scannedAt: "desc" },
    });
  }

  async getPresenceAtPoint(presencePointId: string) {
    return prisma.presenceLog.findMany({
      where: { presencePointId },
      include: {
        worker: true,
      },
      orderBy: { scannedAt: "desc" },
    });
  }
}
