export type PatternMatch = {
    patternId: string;
    label: string;
    confidence: number;
    evidence: string[];
};
export declare class PatternRecognitionEngine {
    detectRepeatedFailures(events: {
        type: string;
        at: string;
    }[], threshold?: number, windowDays?: number): PatternMatch | null;
    detectComplianceDrop(rates: {
        at: string;
        rate: number;
    }[], dropThreshold?: number): PatternMatch | null;
    detectExpiryCluster(expiryDates: string[], clusterWindowDays?: number): PatternMatch | null;
}
//# sourceMappingURL=pattern-engine.d.ts.map