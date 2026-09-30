import type { ExtractedField, FraudSignal } from "../types";
export declare class FraudDetectionEngine {
    analyze(fullText: string, fields: ExtractedField[]): {
        score: number;
        signals: FraudSignal[];
    };
}
//# sourceMappingURL=fraud-detection.d.ts.map