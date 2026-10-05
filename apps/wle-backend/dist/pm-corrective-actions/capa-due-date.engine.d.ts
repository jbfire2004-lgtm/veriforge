import { CailSeverity } from '@prisma/client';
export declare class CapaDueDateEngine {
    computeDueAt(severity: CailSeverity | string, config?: {
        dueDaysLow?: number;
        dueDaysMedium?: number;
        dueDaysHigh?: number;
        dueDaysCritical?: number;
    }, from?: Date): Date;
}
