import type { SchedulingContextInput } from "../types";
export declare class AbsencePredictionEngine {
    predict(ctx: SchedulingContextInput): {
        workerId: string;
        probability: number;
        horizonDays: number;
    }[];
}
//# sourceMappingURL=absence-prediction.d.ts.map