import { PmInspectionScoringMode, PmInspectionTemplateCategory } from '@prisma/client';
export type ShowIfCondition = {
    itemId: string;
    equals: unknown;
} | {
    all: ShowIfCondition[];
} | {
    any: ShowIfCondition[];
};
export type ChecklistItemDef = {
    id: string;
    label: string;
    type: 'pass_fail' | 'numeric' | 'text' | 'select' | 'photo';
    required?: boolean;
    weight?: number;
    critical?: boolean;
    failValues?: unknown[];
    showIf?: ShowIfCondition;
    options?: string[];
    energyType?: string;
    controlHierarchy?: string;
};
export declare const DEFAULT_PM_TEMPLATES: Array<{
    name: string;
    category: PmInspectionTemplateCategory;
    scoringMode: PmInspectionScoringMode;
    equipmentTypeKeys?: string[];
    items: ChecklistItemDef[];
}>;
export declare const DEFICIENCY_ESCALATION_DAYS: Record<string, number>;
export declare const PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG = "pm.inspections.auto_failure_meeting";
export declare function inspectionFailedForAutoMeeting(passed: boolean | null | undefined): boolean;
