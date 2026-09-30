"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyDetectionEngine = void 0;
let anomalyCounter = 0;
class AnomalyDetectionEngine {
    constructor() {
        this.anomalies = [];
    }
    report(partial) {
        const { severity, ...rest } = partial;
        const a = {
            id: `anom_${++anomalyCounter}`,
            detectedAt: new Date().toISOString(),
            ...rest,
            severity: severity ?? "medium",
        };
        this.anomalies.push(a);
        return a;
    }
    detectThreshold(module, code, message, value, threshold, entityType, entityId) {
        if (value < threshold)
            return null;
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
    getAll() {
        return [...this.anomalies].sort((a, b) => {
            const order = { critical: 4, high: 3, medium: 2, low: 1 };
            return order[b.severity] - order[a.severity];
        });
    }
    reset() {
        this.anomalies = [];
        anomalyCounter = 0;
    }
}
exports.AnomalyDetectionEngine = AnomalyDetectionEngine;
//# sourceMappingURL=anomaly-engine.js.map