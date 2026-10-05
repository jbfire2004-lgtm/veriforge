import type { ChecklistItemDef } from './pm-inspections.constants';
export declare class InspectionTemplateEngine {
    visibleItems(items: ChecklistItemDef[], answers: Record<string, unknown>): ChecklistItemDef[];
    validateRequired(items: ChecklistItemDef[], answers: Record<string, unknown>): string[];
}
