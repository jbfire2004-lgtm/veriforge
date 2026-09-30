import { Injectable } from '@nestjs/common';
import { WorkersService } from '../../../workers/workers.service';
import { RegistryService } from '../../vera-core/registry.service';
import { CompanyLinksService } from '../../vera-core/company-links.service';
import { ProjectsService } from '../../vera-core/projects.service';
import { WalletsService } from '../../vera-core/wallets.service';
import { TrainingPipelineService } from '../../vera-core/training-pipeline.service';
import { WorkerTrainingHydrationService } from '../../../workers/worker-training-hydration.service';
import { WorkerProjectReadinessService } from '../../../workers/worker-project-readiness.service';
import { PmCompanyTrainingRoleType } from '@prisma/client';
import { WorkerRepository } from '../repositories/worker.repository';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';
import type { CreateWorkerDto } from '../../../workers/dto/create-worker.dto';
import type { UpdateWorkerDto } from '../../../workers/dto/update-worker.dto';

@Injectable()
export class WorkerApiService {
  constructor(
    private readonly workers: WorkersService,
    private readonly registry: RegistryService,
    private readonly companyLinks: CompanyLinksService,
    private readonly projects: ProjectsService,
    private readonly wallets: WalletsService,
    private readonly trainingPipeline: TrainingPipelineService,
    private readonly trainingHydration: WorkerTrainingHydrationService,
    private readonly projectReadiness: WorkerProjectReadinessService,
    private readonly workerRepo: WorkerRepository,
    private readonly events: EventBusService,
  ) {}

  async getWorker(id: number) {
    const worker = await this.workerRepo.findById(id);
    if (!worker) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Worker not found', {
        id,
      });
    }
    return worker;
  }

  searchWorkers(query: {
    q?: string;
    companyId?: number;
    page?: number;
    pageSize?: number;
  }) {
    const where = {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.q
        ? {
            OR: [
              {
                firstName: { contains: query.q, mode: 'insensitive' as const },
              },
              { lastName: { contains: query.q, mode: 'insensitive' as const } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    return this.workerRepo.search(where, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  createWorker(body: CreateWorkerDto) {
    return this.workers.create(body).then((w) => {
      this.events.emit({
        name: DomainEvent.WORKER_CREATED,
        occurredAt: new Date().toISOString(),
        entityType: 'worker',
        entityId: w.id,
        companyId: w.companyId ?? undefined,
      });
      return w;
    });
  }

  updateWorker(id: number, body: UpdateWorkerDto) {
    return this.workers.update(id, body).then((w) => {
      this.events.emit({
        name: DomainEvent.WORKER_UPDATED,
        occurredAt: new Date().toISOString(),
        entityType: 'worker',
        entityId: id,
      });
      return w;
    });
  }

  async linkCompany(
    workerId: number,
    companyId: number,
    role?: string,
    trade?: string,
  ) {
    const link = await this.companyLinks.linkWorker(workerId, companyId, {
      role,
      trade,
    });
    this.events.emit({
      name: DomainEvent.WORKER_LINKED,
      occurredAt: new Date().toISOString(),
      entityType: 'worker',
      entityId: workerId,
      companyId,
    });
    const training = await this.trainingHydration
      .hydrateWorkerTraining(workerId, {
        roleType:
          role &&
          Object.values(PmCompanyTrainingRoleType).includes(
            role as PmCompanyTrainingRoleType,
          )
            ? (role as PmCompanyTrainingRoleType)
            : undefined,
      })
      .catch(() => null);
    return { ...link, trainingSummary: training?.summary ?? null };
  }

  async unlinkCompany(workerId: number, companyId: number) {
    await this.companyLinks.endAssignment(workerId, companyId);
    this.events.emit({
      name: DomainEvent.WORKER_UNLINKED,
      occurredAt: new Date().toISOString(),
      entityType: 'worker',
      entityId: workerId,
      companyId,
    });
    return { ok: true };
  }

  assignProject(workerId: number, projectId: number) {
    return this.projects.assignWorker(projectId, workerId).then(async (r) => {
      this.events.emit({
        name: DomainEvent.PROJECT_ASSIGNED,
        occurredAt: new Date().toISOString(),
        entityType: 'worker',
        entityId: workerId,
        projectId,
      });
      const training = await this.trainingHydration
        .hydrateWorkerTraining(workerId, { projectId })
        .catch(() => null);
      return { ...r, trainingSummary: training?.summary ?? null };
    });
  }

  getWallet(workerId: number) {
    return this.wallets.getWorkerWallet(workerId);
  }

  getWorkerTraining(
    workerId: number,
    options?: {
      roleType?: string;
      requiredCodes?: string[];
      projectId?: number;
    },
  ) {
    const roleType =
      options?.roleType &&
      Object.values(PmCompanyTrainingRoleType).includes(
        options.roleType as PmCompanyTrainingRoleType,
      )
        ? (options.roleType as PmCompanyTrainingRoleType)
        : undefined;
    return this.trainingHydration.hydrateWorkerTraining(workerId, {
      ...options,
      roleType,
    });
  }

  getWorkerProjectReadiness(workerId: number, projectId: number) {
    return this.projectReadiness.evaluate(workerId, projectId);
  }

  uploadTraining(body: Record<string, unknown>) {
    return this.trainingPipeline.ingest(body as never).then((r) => {
      this.events.emit({
        name: DomainEvent.TRAINING_UPLOADED,
        occurredAt: new Date().toISOString(),
        entityType: 'training',
        entityId: (r as { id?: number })?.id,
        data: body,
      });
      return r;
    });
  }
}
