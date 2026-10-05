import { PmInspectionScoringMode } from '@prisma/client';
import type { ChecklistItemDef } from './pm-inspections.constants';
import { InspectionTemplateEngine } from './inspection-template.engine';
export type InspectionScoreResult = {
    scorePercent: number;
    passed: boolean;
    riskScore: number;
    requiresSupervisorReview: boolean;
    failedItemIds: string[];
    explainability: Array<{
        rule: string;
        detail: string;
    }>;
};
export declare class InspectionScoringEngine {
    private readonly templateEngine;
    constructor(templateEngine: InspectionTemplateEngine);
    score(scoringMode: PmInspectionScoringMode, items: ChecklistItemDef[], answers: Record<string, unknown>, scoringRules?: Record<string, unknown>): InspectionScoreResult;
    private isFailed;
}
