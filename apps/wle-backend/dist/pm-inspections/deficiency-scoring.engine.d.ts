import { PmDeficiencySeverity } from '@prisma/client';
import type { ChecklistItemDef } from './pm-inspections.constants';
export declare class DeficiencyScoringEngine {
    severityForFailedItem(item: ChecklistItemDef, templateCategory: string): PmDeficiencySeverity;
    dueDateFor(severity: PmDeficiencySeverity): Date;
    requiresSupervisorReview(severity: PmDeficiencySeverity): boolean;
}
