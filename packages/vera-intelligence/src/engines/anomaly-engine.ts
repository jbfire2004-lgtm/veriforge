import type { Anomaly, IntelligenceModule, RiskLevel } from "../types";

let anomalyCounter = 0;

export class AnomalyDetectionEngine {
  private anomalies: Anomaly[] = [];

  report(
    partial: Omit<Anomaly, "id" | "detectedAt"> & { severity?: RiskLevel }
  ): Anomaly {
    const { severity, ...rest } = partial;
    const a: Anomaly = {
      id: `anom_${++anomalyCounter}`,
      detectedAt: new Date().toISOString(),
      ...rest,
      severity: severity ?? "medium",
    };
    this.anomalies.push(a);
    return a;
  }

  detectThreshold(
    module: IntelligenceModule,
    code: string,
    message: string,
    value: number,
    threshold: number,
    entityType?: string,
    entityId?: string
  ): Anomaly | null {
    if (value < threshold) return null;
    return this.report({
      module,
      code,
      message,
      severity: value >= threshold * 2 ? "critical" : "high",
      entityType,
      entityId,
      evidence: { value, threshold },
    });
  }

  getAll(): Anomaly[] {
    return [...this.anomalies].sort((a, b) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return order[b.severity] - order[a.severity];
    });
  }

  reset(): void {
    this.anomalies = [];
    anomalyCounter = 0;
  }
}
