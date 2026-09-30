import { prisma } from "../lib/prisma";

export class HeartbeatService {
  async registerHeartbeat(workerId: string) {
    const now = new Date();

    await prisma.heartbeatEvent.create({
      data: {
        workerId,
        createdAt: now,
      },
    });

    return prisma.worker.update({
      where: { id: workerId },
      data: { lastHeartbeat: now },
      include: {
        heartbeats: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async getLastHeartbeat(workerId: string) {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        lastHeartbeat: true,
        heartbeats: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
    return worker;
  }
}
