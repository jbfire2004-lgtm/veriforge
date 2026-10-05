import type { ChecklistItemDef, ShowIfCondition } from './pm-inspections.constants';
export declare function normalizeInspectionAnswer(value: unknown): unknown;
export declare function inspectionAnswersEqual(actual: unknown, expected: unknown): boolean;
export declare function evaluateShowIfCondition(condition: ShowIfCondition, answers: Record<string, unknown>, visibleIds: Set<string>): boolean;
export declare function computeVisibleItemIds(items: Pick<ChecklistItemDef, 'id' | 'showIf'>[], answers: Record<string, unknown>): Set<string>;
export declare function visibleChecklistItems(items: ChecklistItemDef[], answers: Record<string, unknown>): ChecklistItemDef[];
export declare function isChecklistItemVisible(itemId: string, items: Pick<ChecklistItemDef, 'id' | 'showIf'>[], answers: Record<string, unknown>): boolean;
export declare function pruneHiddenChecklistAnswers<T extends Record<string, unknown>>(items: Pick<ChecklistItemDef, 'id' | 'showIf'>[], answers: T): T;
