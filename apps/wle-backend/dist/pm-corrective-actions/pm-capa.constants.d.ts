import { CailSeverity, PmCorrectiveActionType } from '@prisma/client';
export declare const DUE_DAYS_DEFAULT: {
    low: number;
    medium: number;
    high: number;
    critical: number;
};
export declare const ESCALATION_LEVELS: {
    readonly 1: "Reminder";
    readonly 2: "Supervisor escalation";
    readonly 3: "Safety escalation";
    readonly 4: "Project manager escalation";
    readonly 5: "Company-level escalation";
};
export declare const SOURCE_MODULE_TO_CAIL: Record<string, string>;
export declare function severityToScore(sev: CailSeverity | string): number;
export declare function actionTypeDefault(type: PmCorrectiveActionType): {
    priorityBoost: number;
};
