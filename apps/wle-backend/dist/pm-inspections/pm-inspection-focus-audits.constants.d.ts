import { PmInspectionScoringMode, PmInspectionTemplateCategory } from '@prisma/client';
import type { ChecklistItemDef } from './pm-inspections.constants';
export type FocusAuditIndustry = 'construction' | 'mining' | 'manufacturing' | 'oil_gas' | 'nuclear' | 'power_generation' | 'wind' | 'utilities' | 'forestry' | 'general';
export type SystemTemplateDef = {
    name: string;
    category: PmInspectionTemplateCategory;
    scoringMode: PmInspectionScoringMode;
    description?: string;
    scoringRules?: Record<string, unknown>;
    equipmentTypeKeys?: string[];
    items: ChecklistItemDef[];
};
export declare const pf: (id: string, label: string, opts?: Partial<ChecklistItemDef>) => ChecklistItemDef;
export declare const photoItem: ChecklistItemDef;
export declare function focusAudit(title: string, industry: FocusAuditIndustry, industryLabel: string, focusArea: string, category: PmInspectionTemplateCategory, description: string, items: ChecklistItemDef[]): SystemTemplateDef;
export declare const SMART_SITE_TEMPLATE: SystemTemplateDef;
export declare const FOCUS_AUDIT_TEMPLATES: SystemTemplateDef[];
export declare const INDUSTRY_LABELS: Record<FocusAuditIndustry, string>;
