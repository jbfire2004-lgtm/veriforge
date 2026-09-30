import { Injectable } from '@nestjs/common';
import type { ChecklistItemDef } from './pm-inspections.constants';
import {
  pruneHiddenChecklistAnswers,
  visibleChecklistItems,
} from './inspection-show-if';

@Injectable()
export class InspectionTemplateEngine {
  /** Returns visible items after evaluating showIf conditional branches (nested + compound). */
  visibleItems(
    items: ChecklistItemDef[],
    answers: Record<string, unknown>,
  ): ChecklistItemDef[] {
    return visibleChecklistItems(items, answers);
  }

  validateRequired(
    items: ChecklistItemDef[],
    answers: Record<string, unknown>,
  ): string[] {
    const pruned = pruneHiddenChecklistAnswers(items, answers);
    const visible = this.visibleItems(items, pruned);
    const errors: string[] = [];
    for (const item of visible) {
      if (!item.required) continue;
      const val = pruned[item.id];
      if (val === undefined || val === null || val === '') {
        errors.push(`Required: ${item.label}`);
      }
      if (item.type === 'pass_fail' && val === undefined) {
        errors.push(`Required pass/fail: ${item.label}`);
      }
    }
    return errors;
  }
}
