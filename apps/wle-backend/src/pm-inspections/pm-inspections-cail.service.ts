import { Injectable } from '@nestjs/common';
import { CailSeverity, PmDeficiencySeverity } from '@prisma/client';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';

@Injectable()
export class PmInspectionsCailService {
  constructor(private readonly emitter: CailEmitterService) {}

  severityMap(sev: PmDeficiencySeverity): CailSeverity {
    const map: Record<PmDeficiencySeverity, CailSeverity> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    };
    return map[sev];
  }

  async emitFromDeficiency(input: {
    projectId: number;
    ownerCompanyId: number;
    inspectionId: string;
    deficiencyId: string;
    title: string;
    description?: string;
    severity: PmDeficiencySeverity;
    createdByUserId?: number;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    assignedUserId?: number;
    dueDate?: Date;
  }) {
    return this.emitter.emit({
      projectId: input.projectId,
      ownerCompanyId: input.ownerCompanyId,
      sourceType: 'inspection',
      sourceId: input.inspectionId,
      sourceItemId: input.deficiencyId,
      title: input.title.slice(0, 120),
      description: input.description,
      severity: this.severityMap(input.severity),
      createdByUserId: input.createdByUserId,
      siteId: input.siteId,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      assignedUserId: input.assignedUserId,
      dueDate: input.dueDate,
      tags: ['pm-inspection', 'deficiency'],
    });
  }
}
