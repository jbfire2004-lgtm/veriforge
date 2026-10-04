import { LifecycleState, SupervisorConfirmationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ExpiryRules } from "../types/rules";

const DAY_MS = 86_400_000;

export class SupervisorService {
  async createConfirmationRequest(workerId: string, supervisorId: string) {
    const existingPending = await prisma.supervisorConfirmation.findFirst({
      where: {
        workerId,
        supervisorId,
        status: SupervisorConfirmationStatus.pending,
      },
    });

    if (existingPending) {
      return { request: existingPending, created: false };
    }

    const createdRequest = await prisma.supervisorConfirmation.create({
      data: {
        workerId,
        supervisorId,
        status: SupervisorConfirmationStatus.pending,
      },
    });
    return { request: createdRequest, created: true };
  }

  async respondToRequest(requestId: string, status: SupervisorConfirmationStatus) {
    if (status === SupervisorConfirmationStatus.pending) {
      throw new Error("Pending is not a valid response status");
    }

    const now = new Date();
    const request = await prisma.supervisorConfirmation.update({
      where: { id: requestId },
      data: {
        status,
        respondedAt: now,
      },
      include: {
        worker: true,
      },
    });

    if (status === SupervisorConfirmationStatus.not_on_site) {
      await prisma.worker.update({
        where: { id: request.workerId },
        data: { lifecycleState: LifecycleState.inactive },
      });
    }

    if (status === SupervisorConfirmationStatus.confirmed_on_site) {
      await prisma.worker.update({
        where: { id: request.workerId },
        data: { lastHeartbeat: now, lifecycleState: LifecycleState.active },
      });
    }

    return request;
  }

  async getPendingRequests(supervisorId: string) {
    return prisma.supervisorConfirmation.findMany({
      where: {
        supervisorId,
        status: SupervisorConfirmationStatus.pending,
      },
      include: {
        worker: true,
      },
      orderBy: { requestedAt: "asc" },
    });
  }

  async processLifecycleConfirmationRequests(rules: ExpiryRules) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - rules.notSeenDays * DAY_MS);

    const staleWorkers = await prisma.worker.findMany({
      where: {
        lastHeartbeat: {
          lt: cutoff,
        },
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    let created = 0;
    for (const worker of staleWorkers) {
      const result = await this.createConfirmationRequest(worker.id, worker.companyId);
      if (result.created) {
        created += 1;
      }
    }

    return {
      staleWorkers: staleWorkers.length,
      pendingRequestsEnsured: created,
    };
  }
}
