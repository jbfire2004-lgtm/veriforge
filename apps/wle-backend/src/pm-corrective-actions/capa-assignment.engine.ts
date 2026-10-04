import { Injectable } from '@nestjs/common';
import { PmCapaAssigneeRole } from '@prisma/client';

export type AssigneeSuggestion = {
  userId?: number;
  workerId?: number;
  role: PmCapaAssigneeRole;
  reason: string;
};

@Injectable()
export class CapaAssignmentEngine {
  suggest(input: {
    severity: string;
    sourceModule: string;
    assignedUserId?: number;
    equipmentOwnerUserId?: number;
    projectSafetyLeadId?: number;
    sifLinked?: boolean;
  }): AssigneeSuggestion[] {
    const out: AssigneeSuggestion[] = [];

    if (input.assignedUserId) {
      out.push({
        userId: input.assignedUserId,
        role: 'primary',
        reason: 'Explicit assignee',
      });
    }

    if (input.sourceModule === 'equipment' && input.equipmentOwnerUserId) {
      out.push({
        userId: input.equipmentOwnerUserId,
        role: 'primary',
        reason: 'Equipment owner',
      });
    }

    if (
      (input.severity === 'high' ||
        input.severity === 'critical' ||
        input.sifLinked) &&
      input.projectSafetyLeadId
    ) {
      out.push({
        userId: input.projectSafetyLeadId,
        role: 'secondary',
        reason: 'Safety team oversight',
      });
    }

    if (out.length === 0 && input.projectSafetyLeadId) {
      out.push({
        userId: input.projectSafetyLeadId,
        role: 'primary',
        reason: 'Default project safety lead',
      });
    }

    return out;
  }
}
