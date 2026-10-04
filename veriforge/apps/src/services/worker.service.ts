import { CertStatus, LifecycleState, OrientationStatus, Worker } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ExpiryRules } from "../types/rules";

const DAY_MS = 86_400_000;

export class WorkerService {
  async getAllWorkers(params?: {
    lifecycleState?: LifecycleState;
    companyId?: string;
  }) {
    return prisma.worker.findMany({
      where: {
        lifecycleState: params?.lifecycleState,
        companyId: params?.companyId,
      },
      include: {
        certifications: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getWorkerById(id: string) {
    return prisma.worker.findUnique({
      where: { id },
      include: {
        certifications: true,
        heartbeats: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
  }

  async createWorker(data: {
    firstName: string;
    lastName: string;
    companyId: string;
    orientationStatus?: OrientationStatus;
    orientationDate?: Date | null;
    lifecycleState?: LifecycleState;
  }) {
    return prisma.worker.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: data.companyId,
        orientationStatus: data.orientationStatus ?? OrientationStatus.missing,
        orientationDate: data.orientationDate ?? null,
        lifecycleState: data.lifecycleState ?? LifecycleState.not_seen,
      },
    });
  }

  async updateWorker(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      companyId: string;
      orientationStatus: OrientationStatus;
      orientationDate: Date | null;
      lifecycleState: LifecycleState;
    }>,
  ) {
    return prisma.worker.update({
      where: { id },
      data,
    });
  }

  async deleteWorker(id: string) {
    await prisma.worker.delete({ where: { id } });
    return { success: true };
  }

  applyLifecycleRules(
    worker: Worker & { certifications: Array<{ expiry: Date | null; status: CertStatus }> },
    rules: ExpiryRules,
    now = new Date(),
  ): LifecycleState {
    // 1) Missing required docs/certs has highest precedence
    const missingOrExpiredCert = worker.certifications.some((c) => {
      if (!c.expiry) return true;
      return c.expiry.getTime() <= now.getTime() || c.status === CertStatus.expired;
    });
    if (missingOrExpiredCert) return LifecycleState.missing_docs;

    // 2) Orientation checks
    if (!worker.orientationDate || worker.orientationStatus === OrientationStatus.missing) {
      return LifecycleState.missing_docs;
    }

    const orientationAgeMs = now.getTime() - worker.orientationDate.getTime();
    if (
      worker.orientationStatus === OrientationStatus.expired ||
      orientationAgeMs > rules.orientationExpiryDays * DAY_MS
    ) {
      return LifecycleState.expired;
    }

    // 3) Presence checks
    if (!worker.lastHeartbeat) return LifecycleState.not_seen;
    const heartbeatAgeMs = now.getTime() - worker.lastHeartbeat.getTime();
    // Stale workers are handled by supervisor confirmation workflow.
    if (heartbeatAgeMs > rules.notSeenDays * DAY_MS) {
      if (worker.lifecycleState === LifecycleState.inactive) {
        return LifecycleState.inactive;
      }
      return LifecycleState.not_seen;
    }

    return LifecycleState.active;
  }

  async updateLifecycleState(workerId: string, newState: LifecycleState) {
    return prisma.worker.update({
      where: { id: workerId },
      data: { lifecycleState: newState },
      include: { certifications: true },
    });
  }

  async evaluateAllLifecycles(rules: ExpiryRules) {
    const workers = await prisma.worker.findMany({
      include: { certifications: true },
    });

    let updated = 0;

    for (const worker of workers) {
      const nextState = this.applyLifecycleRules(worker, rules);
      if (nextState !== worker.lifecycleState) {
        await this.updateLifecycleState(worker.id, nextState);
        updated += 1;
      }
    }

    return { processed: workers.length, updated };
  }
}
