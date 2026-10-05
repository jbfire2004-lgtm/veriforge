import { Injectable } from '@nestjs/common';
import { InspectionKind } from '@prisma/client';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';

/** Legacy vera-core inspection surface — delegates to InspectionCoreModule. */
@Injectable()
export class InspectionsCoreService {
  constructor(private readonly inspectionCore: InspectionCoreService) {}

  async createInspection(data: {
    equipmentId: number;
    inspectorId: number;
    workerId?: number;
    siteId?: number;
    kind?: InspectionKind;
    checklistId?: number;
    checklist: Record<string, unknown>;
    passed: boolean;
    photos?: string[];
    correctiveActions?: string;
    notes?: string;
    meterReading?: number;
    signature?: string;
  }) {
    return this.inspectionCore.submitInspection(
      {
        equipmentId: data.equipmentId,
        workerId: data.workerId,
        siteId: data.siteId,
        kind: data.kind,
        checklistId: data.checklistId,
        checklist: data.checklist,
        passed: data.passed,
        photos: data.photos,
        correctiveActions: data.correctiveActions,
        notes: data.notes,
        meterReading: data.meterReading,
        signature: data.signature,
      },
      data.inspectorId,
    );
  }

  async listForEquipment(equipmentId: number) {
    return this.inspectionCore.listForEquipment(equipmentId);
  }
}
