import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../../vera-core/projects.service';
import { ProjectRepository } from '../repositories/project.repository';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';

@Injectable()
export class ProjectApiService {
  constructor(
    private readonly projects: ProjectsService,
    private readonly projectRepo: ProjectRepository,
    private readonly reporting: ReportingCoreService,
    private readonly events: EventBusService,
  ) {}

  create(data: Parameters<ProjectsService['create']>[0]) {
    return this.projects.create(data);
  }

  async get(id: number) {
    const p = await this.projectRepo.findById(id);
    if (!p) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Project not found', {
        id,
      });
    }
    return p;
  }

  assignWorker(projectId: number, workerId: number, assignedBy?: number) {
    return this.projects
      .assignWorker(projectId, workerId, assignedBy)
      .then((r) => {
        this.events.emit({
          name: DomainEvent.PROJECT_ASSIGNED,
          occurredAt: new Date().toISOString(),
          projectId,
          entityType: 'worker',
          entityId: workerId,
        });
        return r;
      });
  }

  assignEquipment(projectId: number, equipmentId: number, assignedBy?: number) {
    return this.projects.assignEquipment(projectId, equipmentId, assignedBy);
  }

  readiness(companyId?: number, projectId?: number) {
    return this.reporting.projectReadiness(companyId, projectId);
  }

  close(id: number) {
    return this.projectRepo.close(id).then((p) => {
      this.events.emit({
        name: DomainEvent.PROJECT_CLOSED,
        occurredAt: new Date().toISOString(),
        projectId: id,
      });
      return p;
    });
  }
}
