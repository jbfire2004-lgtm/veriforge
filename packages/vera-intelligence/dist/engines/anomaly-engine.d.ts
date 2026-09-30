import type { Anomaly, IntelligenceModule, RiskLevel } from "../types";
export declare class AnomalyDetectionEngine {
    private anomalies;
    report(partial: Omit<Anomaly, "id" | "detectedAt"> & {
        severity?: RiskLevel;
    }): Anomaly;
    detectThreshold(module: IntelligenceModule, code: string, message: string, value: number, threshold: number, entityType?: string, entityId?: string): Anomaly | null;
    getAll(): Anomaly[];
    reset(): void;
}
//# sourceMappingURL=anomaly-engine.d.ts.map