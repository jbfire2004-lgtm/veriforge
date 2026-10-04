import { Injectable } from '@nestjs/common';
import { PmDeficiencySeverity } from '@prisma/client';
import type { ChecklistItemDef } from './pm-inspections.constants';
import { DEFICIENCY_ESCALATION_DAYS } from './pm-inspections.constants';

@Injectable()
export class DeficiencyScoringEngine {
  severityForFailedItem(
    item: ChecklistItemDef,
    templateCategory: string,
  ): PmDeficiencySeverity {
    if (item.critical) return 'critical';
    if (item.energyType) return 'critical';
    if (item.required && item.weight && item.weight >= 20) return 'high';
    if (templateCategory === 'CRANE' || templateCategory === 'PME')
      return 'high';
    return 'medium';
  }

  dueDateFor(severity: PmDeficiencySeverity): Date {
    const days = DEFICIENCY_ESCALATION_DAYS[severity] ?? 14;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  requiresSupervisorReview(severity: PmDeficiencySeverity): boolean {
    return severity === 'high' || severity === 'critical';
  }
}
