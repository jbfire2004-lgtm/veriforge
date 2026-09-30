import type { SchedulingContextInput } from "../types";
export declare class AvailabilityPredictionEngine {
    predict(ctx: SchedulingContextInput): {
        workerId: string;
        date: string;
        available: boolean;
    }[];
}
//# sourceMappingURL=availability-prediction.d.ts.map