import { Injectable } from '@nestjs/common';
import { PmSafetyEventSeverity } from '@prisma/client';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';

@Injectable()
export class PmSafetyEventsCailService {
  constructor(private readonly emitter: CailEmitterService) {}

  async emitFromEvent(input: {
    projectId: number;
    ownerCompanyId: number;
    eventId: string;
    sourceItemId: string;
    title: string;
    description?: string;
    severity: PmSafetyEventSeverity;
    createdByUserId?: number;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    assignedUserId?: number;
    dueDate?: Date;
  }) {
    const sevMap = {
      low: 'low' as const,
      medium: 'medium' as const,
      high: 'high' as const,
      critical: 'critical' as const,
    };
    return this.emitter.emit({
      projectId: input.projectId,
      ownerCompanyId: input.ownerCompanyId,
      sourceType: 'incident',
      sourceId: input.eventId,
      sourceItemId: input.sourceItemId,
      title: input.title.slice(0, 120),
      description: input.description,
      severity: sevMap[input.severity],
      createdByUserId: input.createdByUserId,
      siteId: input.siteId,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      assignedUserId: input.assignedUserId,
      dueDate: input.dueDate,
      tags: ['pm-safety-event'],
    });
  }
}
