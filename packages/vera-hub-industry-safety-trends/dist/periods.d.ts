/** Period parsing & expansion for trend series */
export declare function parsePeriod(period: string): {
    kind: "month";
    year: number;
    month: number;
} | {
    kind: "quarter";
    year: number;
    quarter: number;
} | null;
export declare function periodSortKey(period: string): number;
export declare function sortPeriods(periods: string[]): string[];
export declare function monthBucket(period: string): string | null;
/** Expand anchor period into trailing window (inclusive). */
export declare function expandTrailingPeriods(anchor: string, count: number): string[];
export declare function nextPeriod(period: string): string | null;
export declare function horizonSteps(horizon: "1m" | "3m" | "6m", kind: "month" | "quarter"): number;
