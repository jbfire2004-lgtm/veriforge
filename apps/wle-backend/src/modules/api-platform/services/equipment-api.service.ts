import { Injectable } from '@nestjs/common';
import { EquipmentCoreService } from '../../equipment-core/equipment-core.service';
import { EquipmentLinksService } from '../../vera-core/equipment-links.service';
import { ProjectsService } from '../../vera-core/projects.service';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';

@Injectable()
export class EquipmentApiService {
  constructor(
    private readonly equipmentCore: EquipmentCoreService,
    private readonly equipmentLinks: EquipmentLinksService,
    private readonly projects: ProjectsService,
    private readonly equipmentRepo: EquipmentRepository,
    private readonly events: EventBusService,
  ) {}

  async getEquipment(id: number) {
    const row = await this.equipmentRepo.findById(id);
    if (!row) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Equipment not found', {
        id,
      });
    }
    return row;
  }

  list(companyId?: number, page?: number, pageSize?: number) {
    return this.equipmentRepo.list(companyId ? { companyId } : {}, {
      page,
      pageSize,
    });
  }

  create(body: Record<string, unknown>) {
    return this.equipmentCore.create(body as never).then((e) => {
      this.events.emit({
        name: DomainEvent.EQUIPMENT_CREATED,
        occurredAt: new Date().toISOString(),
        entityType: 'equipment',
        entityId: (e as { id: number }).id,
      });
      return e;
    });
  }

  update(id: number, body: Record<string, unknown>) {
    return this.equipmentCore.update(id, body as never).then((e) => {
      this.events.emit({
        name: DomainEvent.EQUIPMENT_UPDATED,
        occurredAt: new Date().toISOString(),
        entityType: 'equipment',
        entityId: id,
      });
      return e;
    });
  }

  linkCompany(equipmentId: number, companyId: number) {
    return this.equipmentLinks
      .linkEquipment(equipmentId, companyId)
      .then((link) => {
        this.events.emit({
          name: DomainEvent.EQUIPMENT_LINKED,
          occurredAt: new Date().toISOString(),
          entityType: 'equipment',
          entityId: equipmentId,
          companyId,
        });
        return link;
      });
  }

  assignProject(equipmentId: number, projectId: number) {
    return this.projects.assignEquipment(projectId, equipmentId).then((r) => {
      this.events.emit({
        name: DomainEvent.PROJECT_ASSIGNED,
        occurredAt: new Date().toISOString(),
        entityType: 'equipment',
        entityId: equipmentId,
        projectId,
      });
      return r;
    });
  }

  lockout(equipmentId: number, reason?: string, userId?: number) {
    return this.equipmentCore.lockout(equipmentId, { reason } as never, userId);
  }

  unlock(equipmentId: number, notes?: string, userId?: number) {
    return this.equipmentCore.unlock(equipmentId, userId, notes);
  }

  getWallet(equipmentId: number) {
    return this.equipmentCore.getWallet(equipmentId);
  }
}
