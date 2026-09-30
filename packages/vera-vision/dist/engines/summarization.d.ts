import type { ExtractedField, FraudSignal, MappingCandidate } from "../types";
export declare class VisionSummarizationEngine {
    summarize(title: string, fields: ExtractedField[], fraud: {
        score: number;
        signals: FraudSignal[];
    }, mappings: MappingCandidate[], extras?: string[]): {
        text: string;
        bullets: string[];
    };
}
//# sourceMappingURL=summarization.d.ts.map